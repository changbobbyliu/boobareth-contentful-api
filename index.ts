import { useQuery } from "react-query";

const gql = {
	topicProductCollection: `
    query topicProductCollection($preview: Boolean) {
      topicProductCollection(preview: $preview) {
        items {
          sys { id }
          name
          featuredImage { url }
        }
      }
    }
  `,
	portfolio: `
		query portfolios($preview: Boolean) {
			portfolioCollection(preview: $preview) {
				items {
					sys { id }
					name
					description
					techs
					url
					previewImage { url }
					categoriesCollection {
						items { name }
					}
				}
			}
			portfolioCategoryCollection(preview: $preview) {
				items {
					name
				}
			}
		}
	`,
};

export type TGQL = {
	topicProductCollection: NSContentful.DTO.TMyTopic[];
	portfolio: {
		portfolioCollection: NSContentful.DTO.TPortfolio[];
		portfolioCategoryCollection: NSContentful.DTO.TPortfolioCategory[];
	};
};

export class ContentfulService {
	//#region Singleton setup
	private static instance: ContentfulService;
	private constructor(
		private _spaceID: string,
		private _cpaToken: string,
		private _cdaToken: string
	) {}
	/**
	 * Initialize the ContentfulService singleton
	 */
	static init(config: NSContentful.TTokenConfig) {
		ContentfulService.instance = new ContentfulService(
			config.spaceID,
			config.cpaToken,
			config.cdaToken
		);
	}
	static getInstance() {
		if (!ContentfulService.instance) {
			throw new Error("ContentfulService is not initialized");
		}
		return ContentfulService.instance;
	}
	//#endregion

	private getClientConfig(isPreview?: boolean) {
		return (query: string) => ({
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${isPreview ? this._cpaToken : this._cdaToken}`,
			},
			body: JSON.stringify({
				query,
				variables: { preview: isPreview },
			}),
		});
	}

	async get(query: keyof TGQL, config: NSContentful.TApiConfig = {}) {
		const promise = fetch(
			`https://graphql.contentful.com/content/v1/spaces/${this._spaceID}/environments/${
				config.env ?? "master"
			}`,
			this.getClientConfig(config.isPreview || false)(gql[query])
		)
			.then((res) => res.json())
			.then((res) => res.data);

		if (config.delay) {
			return new Promise<TGQL[typeof query]>((resolve) => {
				setTimeout(() => {
					resolve(promise);
				}, config.delay);
			});
		}
		return promise;
	}

	async getTopicProductCollection(config: NSContentful.TApiConfig = {}) {
		const promise = this.get("topicProductCollection", config)
			.then((res) => res["topicProductCollection"])
			.then((res) => res.items as NSContentful.DTO.TMyTopic[]);

		return promise;
	}

	//#region useQuery hooks
	static useGetPortfolioQuery(config: NSContentful.TApiConfig = {}) {
		return useQuery<
			{
				portfolios: NSContentful.DTO.TPortfolio[];
				portfolioCategories: NSContentful.DTO.TPortfolioCategory[];
			},
			{ message: string }
		>("portfolio", () =>
			ContentfulService.getInstance()
				.get("portfolio", config)
				.then((res) => ({
					portfolios: res.portfolioCollection.items,
					portfolioCategories: res.portfolioCategoryCollection.items,
				}))
		);
	}
	//#endregion
}
