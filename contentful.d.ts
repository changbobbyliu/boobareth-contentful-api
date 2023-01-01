declare namespace NSContentful {
	type TApiConfig = { isPreview?: boolean; env?: "master" | "dev"; delay?: number };
	type TTokenConfig = {
		spaceID: string;
		cdaToken: string;
		cpaToken: string;
	};

	declare namespace DTO {
		type TMyTopic = { sys: { id: string }; name: string; featuredImage: { url: string } };

		type TPortfolioCategory = { name: string };

		type TPortfolio = {
			sys: { id: string };
			name: string;
			description: string;
			techs: string[];
			url: string;
			previewImage?: { url: string } | null;
			categoriesCollection: { items: TPortfolioCategory[] };
		};
	}
}
