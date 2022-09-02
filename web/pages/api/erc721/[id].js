const metadata = {
    1: {
        attributes: [
            {
                trait_type: "Cow type",
                value: "Indy mithical",
            },
            {
                trait_type: "Gender",
                value: "Female",
            },
        ],
        description: "A nice looking cow.",
        image: "https://lh3.googleusercontent.com/ppUgH3b3bg0DPeokriHRxaGIjvfCxhN6UfrPJiDkhQ2k5cOPCIbcB3tIbhcvEuNp-7J7VvZ9xCeOHqEWDSVDgjF_cjTIFR0V-h9dqQ=s0",
        name: "Cowmoonity 171",
    },
    2: {
        attributes: [
            {
                trait_type: "Cow type",
                value: "Indy mithical",
            },
            {
                trait_type: "Gender",
                value: "Female",
            },
        ],
        description: "A nice looking cow.",
        image: "https://lh3.googleusercontent.com/L-meVztUZaCSZtt2TbwfY7SQDFxz3H07j1LN-KD66Y-cYugLiF2WLS15geP7tQJ7U59vEwCOpdUYlzd-C0A7ML7mh_JyQMZSVZqOTA=s0",
        name: "Cowmoonity 170",
    },
    3: {
        attributes: [
            {
                trait_type: "Cow type",
                value: "Indy mithical",
            },
            {
                trait_type: "Gender",
                value: "Female",
            },
        ],
        description: "A nice looking cow.",
        image: "https://lh3.googleusercontent.com/PEaiuvX0uZm3RKbdqqgOBrP58MMTFG98eRp0afwjxDd5owTgmNyjDgm3CyiVLMY08wgrQN7g2mVnI_rOw0fEybLl0NqziGo4tXbphQ=s0",
        name: "Cowmoonity 169",
    },
}

export default function handler(req, res) {
    res.status(200).json(metadata[req.query.id] || {})
}
