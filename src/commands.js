
import { InlineKeyboard } from "grammy"

export function registerCommands(bot) {
    bot.command("start", (ctx) =>
        ctx.reply(
            `Hi ${ctx.from?.first_name ?? "there"}. I am alive. Send /help to see commands.`,
            { reply_markup: new InlineKeyboard().text("Ping me", "ping") }
        )
    )

    bot.command("help", (ctx) =>
        ctx.reply(
            [
                "Commands:",
                "/start - Start the bot",
                "/help - Show commands",
                "/ping - Test the bot",
                "/id - Show your IDs",
                "/gold - Get latest XAUUSD M5 candle",
            ].join("\n")
        )
    )

    bot.command("ping", (ctx) => ctx.reply("pong"))

    bot.command("id", (ctx) =>
        ctx.reply(`Chat id: ${ctx.chat.id}\nYour id: ${ctx.from?.id ?? "unknown"}`)
    )

    bot.callbackQuery("ping", async (ctx) => {
        await ctx.answerCallbackQuery({ text: "pong" })
    })

    bot.command("gold", async (ctx) => {
        const apiKey = process.env.REALMARKETAPI_KEY

        if (!apiKey) {
            return ctx.reply("API key is missing. Check FadeHost environment variables.")
        }

        try {
            const params = new URLSearchParams({
                apiKey,
                symbolCode: "XAUUSD",
                timeFrame: "M5",
            })

            const response = await fetch(
                `https://api.realmarketapi.com/api/v1/price?${params}`
            )

            const data = await response.json()

            if (!response.ok) {
                return ctx.reply(`Market API error: ${response.status}. Please check your API plan and key.`)
            }

            const candle = data.Data ?? data

            const open = candle.OpenPrice
            const close = candle.ClosePrice
            const high = candle.HighPrice
            const low = candle.LowPrice

            if ([open, close, high, low].some(value => value === undefined || value === null)) {
                return ctx.reply("The API responded, but candle data was not in the expected format.")
            }

            return ctx.reply(
                [
                    "GOLD XAUUSD - M5",
                    `Open: ${open}`,
                    `Close: ${close}`,
                    `High: ${high}`,
                    `Low: ${low}`,
                    "",
                    "Connection test only - not a trading signal.",
                ].join("\n")
            )
        } catch (error) {
            console.error("[gold] API request failed:", error)
            return ctx.reply("Could not connect to the gold market API. Please try again later.")
        }
    })

    bot.on("message:text", (ctx) => ctx.reply(ctx.message.text))
        

