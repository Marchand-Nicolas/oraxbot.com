export function getCookie(cName: string): string | undefined {
  const name = cName + "=";
  const cDecoded = decodeURIComponent(document.cookie);
  const cArr = cDecoded.split("; ");
  let res: string | undefined;
  cArr.forEach((val) => {
    if (val.indexOf(name) === 0) res = val.substring(name.length);
  });
  return res;
}

export function setCookie(
  cName: string,
  cValue: string,
  expSeconds: number,
): void {
  let date = new Date();
  date.setTime(date.getTime() + expSeconds * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
}
