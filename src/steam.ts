import axios from "axios";
import cheerio from "cheerio";
import passport from "passport";
import SteamStrategy from "passport-steam";
import { CsGoData } from "./queryTypes.js";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
const prisma = new PrismaClient();
dotenv.config();
function parseText(text: string) {
  const pattern =
    /Matches: (\d+)ELO: (\d+)K\/D: ([0-9.]+)Winrt: ([0-9.]+)%Wins: (\d+)HS: ([0-9.]+)%/;

  const match = text.match(pattern);

  if (match) {
    const matchesObject = {
      matches: parseInt(match[1]),
      elo: parseInt(match[2]),
      kd: parseFloat(match[3]),
      winrate: parseFloat(match[4]),
      wins: parseInt(match[5]),
      hs: parseFloat(match[6]),
    } as CsGoData;
    return matchesObject;
  } else {
    return null;
  }
}

const steamStrategyClosure = () => {
  return (
    identifier: string,
    profile: any,
    done: (error: any, user?: any, info?: any) => void
  ) => {
    process.nextTick(async function () {
      const steamId = profile._json.steamid;

      const { data } = await axios.get<string>(
        `https://faceitfinder.com/profile/${steamId}`,
        {
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );
      const $ = cheerio.load(data);

      const faceitData = $(".account-faceit-stats-single").text();

      if (faceitData) {
        const result = parseText(faceitData);
        const faceitLvl =
          "https://faceitfinder.com/" +
          $(".account-faceit-level > a > img").attr("src");

        if (result) {
          const csgoData: CsGoData = {
            ...result,
            lvlImg: faceitLvl,
            steamId: steamId,
          };

          done(null, csgoData);
        }
      } else done(null, "noData");
    });
  };
};
export default passport.use(
  new SteamStrategy(
    {
      returnURL: "http://localhost:7000/api/auth/steam",
      realm: "http://localhost:7000/",
      apiKey: String(process.env.STEAM_API_KEY),
    },
    steamStrategyClosure()
  )
);
