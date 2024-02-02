export type YahooCategory = {
  label: string;
  url: string;
};

export type YahooArticleInfo = {
  title: string;
  date: string;
  url: string;
  thumbnail: string | null;
  source: 'yahoo';
  media: string;
};

export type YahooArticleElement =
  | {
      type: 'paragraph';
      text: string;
    }
  | {
      type: 'image';
      src: string;
    };

export type YahooArticle = {
  info: YahooArticleInfo;
  elements: YahooArticleElement[];
  raw: string;
};
