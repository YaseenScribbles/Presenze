// export const LOCAL_URL: string = "http://liveserver/presenze/api/";
// export const STATIC_URL: string = "https://essa.co.in/presenze/api/";

// export const LOCAL_URL_FILE: string = "http://liveserver/presenze/storage";
// export const STATIC_URL_FILE: string = "https://essa.co.in/presenze/storage";

export const URL = 'http://liveserver/presenze/api/';
export const URL_FILE = "http://liveserver/presenze/storage" ;

// export const URL = "https://essa.co.in/presenze/api/";
// export const URL_FILE = "https://essa.co.in/presenze/storage";

export function formatDate(inputDate: string) {
  const date = new Date(inputDate);

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  const formattedDate = formatter.format(date);

  return formattedDate;
}
