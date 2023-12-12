const url = new URL("https://translate.googleapis.com/translate_a/single");
const search = new URLSearchParams();
search.append("client", "gt");
search.append("ie", "UTF-8");
search.append("oe", "UTF-8");
search.append("dt", "t");
search.append("source", "en_US");
search.append("target", "zh_CN");
search.append("q", "sss");
url.search = search.toString()

console.log(url)
