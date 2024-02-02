export const convertToISO8601 = (str: string) => {
  const year = new Date().getFullYear();

  // 正規表現を使用して日付と時間を抽出
  const regex = /(\d+)\/(\d+)\(.+\)\s(\d+):(\d+)/;
  const parts = str.match(regex);

  // マッチしなかった場合は null を返す
  if (!parts) {
    return null;
  }

  const [, mo, d, h, mi] = parts;
  if (!mo || !d || !h || !mi) {
    return null;
  }

  // 抽出した値を整数に変換
  const month = parseInt(mo, 10) - 1; // JSの月は0から始まる
  const day = parseInt(d, 10);
  const hours = parseInt(h, 10);
  const minutes = parseInt(mi, 10);

  // Date オブジェクトを作成
  const date = new Date(year, month, day, hours, minutes);

  // Date オブジェクトを ISO 8601 形式の文字列に変換
  return date.toISOString().slice(0, 16).replace('T', ' ');
};
