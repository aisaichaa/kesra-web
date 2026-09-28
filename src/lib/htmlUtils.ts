export const stripHTML = (html: string) => {
  return html.replace(/<[^>]*>?/g, '');
};