export const imageLinks: string[] = [];

export const loadAvatars = (): string[] => {
  for(let i=0; i<=36;i++){
    imageLinks.push("https://stopots.com/images/avatares/"+i+".svg");
  }
  return imageLinks;
}