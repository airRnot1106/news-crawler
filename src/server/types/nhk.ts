export type NHKCategory = {
  label: string;
  data_category: string;
  url: string;
};

export type NHKArticle = {
  title: string;
  date: string;
  url: string;
  word: {
    label: string;
    url: string;
  } | null;
  thumbnail: string;
};
