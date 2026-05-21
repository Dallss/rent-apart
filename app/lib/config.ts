type Config = {
   apiUrl: string;
 };
 
 let configCache: Config | null = null;
 let configPromise: Promise<Config> | null = null;
 
 export function getConfig(): Promise<Config> {
   if (configCache) {
     return Promise.resolve(configCache);
   }
 
   if (!configPromise) {
     configPromise = fetch("/api/config")
       .then((res) => res.json())
       .then((data) => {
         configCache = data;
         return data;
       });
   }
 
   return configPromise;
 }