/**
 * National teams that are not FIFA members but play in a FIFA confederation or one
 * of its regional federations (Wikipedia, "List of men's national association
 * football teams", September 2026). CONIFA members are not included.
 *
 *  - confederation: a full member of its confederation. Plays its competitions (the
 *    CONCACAF Nations League and Gold Cup, …) but never World Cup qualifying.
 *  - regional: an associate member (Réunion, Kiribati, Tuvalu), or only in a regional
 *    federation (Zanzibar, CECAFA). Regional cups and friendlies only.
 *
 * None has FIFA ranking points: they start from their Elo rating (eloratings.net)
 * converted to the ranking's scale, and their matches do not move the ranking.
 *
 * One row per nation: `CODE confed kind flag subFeds cultures Name`, as in nation-meta.
 */
export const NON_FIFA = `
MTQ CONCACAF confederation mq CFU caribbean-franco:90,french:10 Martinique
GLP CONCACAF confederation gp CFU caribbean-franco:90,french:10 Guadeloupe
GUF CONCACAF confederation gf CFU caribbean-franco:80,french:10,brazilian:10 French_Guiana
BOE CONCACAF confederation bq-bo CFU dutch-caribbean:90,latam:10 Bonaire
SXM CONCACAF confederation sx CFU caribbean-anglo:60,dutch-caribbean:40 Sint_Maarten
SMN CONCACAF confederation mf CFU caribbean-franco:60,caribbean-anglo:40 Saint_Martin
MNP AFC confederation mp EAFF pacific:60,filipino:30,english:10 Northern_Mariana_Islands
REU CAF regional re COSAFA french:60,mauritian:25,malagasy:15 Réunion
ZAN CAF regional tz-zanzibar CECAFA east-african:85,arabic-gulf:15 Zanzibar
KIR OFC regional ki - pacific:100 Kiribati
TUV OFC regional tv - pacific:100 Tuvalu
`
