import axios from "axios";
import cheerio from "cheerio";
import passport from "passport";
import SteamStrategy from "passport-steam";
import { CsGoData } from "./queryTypes.js";
import dotenv from "dotenv";
import parseRelativeDate from "./parseRelativeDate.js";

dotenv.config();

const steamStrategyClosure = () => {
  return (
    identifier: string,
    profile: any,
    done: (error: any, user?: any, info?: any) => void
  ) => {
    process.nextTick(async function () {
      const steamId = (profile._json.steamid as string).trim();

      // const steamId = "76561198970709193";
      console.log(steamId);

      const response = await axios
        .get(`https://faceittracker.net/steam-profile/${steamId}`, {
          withCredentials: false,
        })
        .catch((error) => console.log(error));

      const data = response?.data;
      const $ = cheerio.load(data);

      const playerLinkElement = $("a.faceit_profile-link");
      const playerName = playerLinkElement.find("div.left").text().trim();
      const playerLevelImgSrc =
        "https://faceittracker.net" +
        playerLinkElement.find("div.right img.lvl").attr("src");
      if (playerName) {
        console.log(playerName);
        const { data } = await axios.get<string>(
          `https://faceittracker.net/players/${playerName}`,
          {
            headers: {
              "Cache-Control": "no-cache",
              withCredentials: false,
            },
          }
        );
        const $ = cheerio.load(data);

        const elo = parseInt($("span.player-elo").text());
        const statsCards = $(".stats-card-wrapper .stats-card");

        let stats: any = {};

        statsCards.each((index, element) => {
          const title = $(element).find(".stats-card-title").text().trim();
          const rate = $(element).find(".stats-card-rate").text().trim();
          stats[title] = rate;
        });
        const totalWinsElement = $("li")
          .filter((i, el) => $(el).text().trim() === "Total Win:")
          .next();
        const totalWins = parseInt(totalWinsElement.text().trim());
        const kd = parseFloat(stats["K/D Ratio"]);
        const hs = parseFloat(stats["Headshots"]);
        const totalMatches = parseInt(stats["Matches"]);
        const winrate = parseFloat(stats["Winrate"]);
        const recentMatches = $(".r-macthes-wrapper").html();
        const matchCards = $('a[rel="nofollow"] .r-macthes-card');

        let matches: any = [];

        matchCards.each((index, element) => {
          let match: any = {};
          const infoBlocks = $(element).find(".r-macthes-info");

          infoBlocks.each((i, block) => {
            const title = $(block).find(".title, .result").text().trim();
            const value = $(block).find("span").text().trim();

            if (title === "") {
              match.map = value;
            } else if (title === "K - A - D") {
              match.kad = value;
            } else if (title === "Elo Point") {
              match.eloChange = value;
            } else if (title === "Loss" || title === "Win") {
              match.result = title === "Loss" ? false : true;
              match.stat = value;
            } else if (title === "Rating") {
              match.kd = parseFloat(value);
            } else if (title === "Date") {
              if (!value.includes("ago")) {
                const dateString = value.replace(" - ", " ");
                match.date = new Date(dateString);
              } else {
                match.date = parseRelativeDate(value);
              }
            } else match[title.toLowerCase()] = value;
            const matchLink = $(element).parent().attr("href");
            match.link = "https://faceittracker.net" + matchLink;
          });

          matches.push(match);
        });

        console.log(matches);

        if (totalWins) {
          const csgoData: CsGoData = {
            userId: 1,
            lvlImg: playerLevelImgSrc,
            steamId,
            elo,
            hs,
            matches: totalMatches,
            winrate,
            kd,
            wins: totalWins,
          };

          done(null, { csgoData, matches });
        } else done(null, "noData");
      } else {
        done(null, "noData");
      }
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
