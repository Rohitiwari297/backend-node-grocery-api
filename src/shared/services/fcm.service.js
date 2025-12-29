import admin from "../../core/firebase.js";

export const sendFCM = async ({
    token,
    tokens,
    topic,
    title,
    body,
    data = {},
    imageUrl,
    silent = false,
}) => {
    if (!token && !tokens && !topic) {
        throw new Error("FCM target missing");
    }

    const message = {
        notification: silent
            ? undefined
            : {
                title,
                body,
                image: imageUrl,
            },

        data: Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, String(v)])
        ),

        android: {
            priority: "high",
            notification: silent
                ? undefined
                : {
                    sound: "default",
                    imageUrl,
                },
        },

        apns: {
            payload: {
                aps: {
                    sound: silent ? undefined : "default",
                    "content-available": silent ? 1 : undefined,
                },
            },
            fcmOptions: {
                image: imageUrl,
            },
        },
    };

    if (token) {
        return await admin.messaging().send({ ...message, token });
    }

    if (tokens) {
        return await admin.messaging().sendEachForMulticast({
            ...message,
            tokens,
        });
    }

    if (topic) {
        return await admin.messaging().send({ ...message, topic });
    }
};
