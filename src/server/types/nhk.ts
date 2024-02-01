export type NHKCategory = {
  label: string;
  data_category: string;
  url: string;
};

export type NHKArticleInfo = {
  title: string;
  date: string;
  url: string;
  word: {
    label: string;
    url: string;
  } | null;
  thumbnail: string;
};

export type NHKArticleElement =
  | {
      type: 'paragraph';
      text: string;
    }
  | {
      type: 'image';
      src: string;
    };

export type NHKArticle = {
  info: NHKArticleInfo;
  elements: NHKArticleElement[];
  raw: string;
  source: 'nhk';
  media: 'nhk';
};
