import type en from "../en/engine"

const engine: typeof en = {
  obj: {
    qualify: "{comp} के लिए क्वालीफ़ाई करें",
    unbeaten: "{text} अजेय रहें",
    promotion: "लीग {letter} से प्रमोशन हासिल करें",
    relegation: "लीग {letter} से रेलीगेशन से बचें",
    win: "{comp} जीतें",
    reach: {
      knockout: "{comp} के नॉकआउट चरण में पहुँचें",
      "quarter-finals": "{comp} के क्वार्टर-फ़ाइनल में पहुँचें",
      "semi-finals": "{comp} के सेमीफ़ाइनल में पहुँचें",
      final: "{comp} के फ़ाइनल में पहुँचें",
    },
    debuts: "{year} में 21 साल या उससे कम उम्र के {count} खिलाड़ियों को अंतरराष्ट्रीय डेब्यू दें",
    raiseNote: "इनाम ×{reward}; चूकने पर {cost} भरोसा घटेगा, फिर मूल लक्ष्य ही लागू रहेगा",
    lowerNote: "अभी {cost} भरोसा घटेगा; इनाम आधे",
    lowerNeeds: "बोर्ड तभी सुनेगा जब भरोसा {n}% या उससे ज़्यादा हो",
  },
  news: {
    raise: {
      title: "आपने दाँव बढ़ा दिया",
      body: "आपने फ़ेडरेशन से ज़्यादा का वादा किया है: “{text}”। इसे पूरा करें, वे इसे नहीं भूलेंगे।",
    },
    lower: {
      title: "उम्मीदें घटाई गईं",
      body: "फ़ेडरेशन अनिच्छा से कम लक्ष्य पर राज़ी हुआ है: “{text}”।",
    },
    broken: {
      title: "वादा टूटा",
      body: "आपने “{promised}” का वादा किया था और चूक गए। फ़ेडरेशन अब भी आपसे “{target}” की उम्मीद रखता है।",
    },
    met: {
      title: "लक्ष्य हासिल",
      body: "फ़ेडरेशन बेहद खुश है: “{text}” — पूरा हुआ। अतिरिक्त सहयोग एकेडमियों तक भी पहुँचेगा।",
    },
    missed: {
      title: "लक्ष्य चूक गए",
      body: "फ़ेडरेशन नाखुश है: हम “{text}” में नाकाम रहे।",
    },
    friendly: "एक दोस्ताना मैच",
    derbyWin: {
      title: "डर्बी का दिन {us} के नाम",
      body: "{comp} में पुराने दुश्मन {them} पर {score} की जीत। सड़कों पर जश्न है।",
    },
    derbyLoss: {
      title: "{them} से डर्बी में हार",
      body: "{comp} में {them} से {score} से हार। फ़ैंस इसे जल्दी नहीं भूलेंगे।",
    },
    derbyDraw: {
      title: "डर्बी में बराबरी",
      body: "{comp} में {us} और {them} का मुकाबला {score} से ड्रॉ रहा। किसी को डींग हाँकने का मौका नहीं मिला।",
    },
    fans: {
      angry: {
        title: "फ़ैंस मैनेजर के खिलाफ़ हुए",
        body: "{nation} के समर्थकों ने अपना गुस्सा साफ़ जता दिया है। बोर्ड सुन रहा है।",
      },
      adore: {
        title: "फ़ैंस आपके साथ हैं",
        body: "{nation} के समर्थक मैनेजर का नाम गा रहे हैं। स्टेडियम गूँज उठेगा।",
      },
    },
    invitational: {
      title: "{host} करेगा {comp} की मेज़बानी",
      body: "{host} {comp} की मेज़बानी करेगा, जिसमें {teams} हिस्सा लेंगी। यह {date} को शुरू होगा।",
    },
    invite: {
      title: "{host} की ओर से निमंत्रण",
      body: "{host} ने हमें {date} से शुरू होने वाली विंडो में {n}-टीम टूर्नामेंट में बुलाया है। उन्हें जवाब चाहिए।",
    },
    inviteLapsed: {
      title: "निमंत्रण की अवधि खत्म",
      body: "हमने {host} के निमंत्रण का समय पर जवाब नहीं दिया; टूर्नामेंट हमारे बिना होगा।",
    },
    inviteOff: {
      title: "टूर्नामेंट रद्द",
      body: "{host} का टूर्नामेंट नहीं हो सका: हर टीम अब खाली नहीं है।",
    },
    riot: {
      title: "{us} ने {them} को रौंद डाला",
      body: "{comp} में {them} पर {score} की जीत। फ़ैंस इसे याद रखेंगे।",
    },
    shock: {
      title: "{them} पर चौंकाने वाली जीत",
      body: "हमसे बहुत कम को उम्मीद थी, लेकिन हमने {comp} में {them} को {score} से हरा दिया।",
    },
    humiliation: {
      title: "{them} के सामने शर्मिंदगी",
      body: "{comp} में {them} से {score} की हार। मैनेजर पर सवाल उठ रहे हैं।",
    },
    embarrassing: {
      title: "{them} से शर्मनाक हार",
      body: "हमसे जीत की उम्मीद थी, लेकिन {comp} में {them} से {score} से हार गए।",
    },
    cap: {
      title: "{name} का {caps}वाँ कैप",
      body: "{name} अब {nation} के लिए {caps} मैच खेल चुके हैं।",
    },
    goals: {
      title: "{name} के {goals} अंतरराष्ट्रीय गोल",
      body: "{name} अब {nation} के लिए {goals} गोल कर चुके हैं।",
    },
    debut: {
      title: "{name} का पहला कैप",
      body: "{opp} के खिलाफ़ अंतरराष्ट्रीय डेब्यू कर रहे हैं: {names}।",
    },
    debuts: {
      title: "{n} डेब्यू",
    },
    milestone: "मील का पत्थर पार",
    ultimatum: {
      title: "अंतिम चेतावनी",
      body: "फ़ेडरेशन का धैर्य जवाब दे गया है। {matches} प्रतिस्पर्धी मैचों में उसका भरोसा {lifted}% तक बढ़ाएँ, वरना आपको हटा दिया जाएगा।",
    },
    eases: {
      title: "दबाव घटा",
      body: "नतीजे पलट गए हैं। फ़ेडरेशन ने अपनी अंतिम चेतावनी वापस ले ली है।",
    },
    sacked: {
      title: "बर्खास्त",
      body: "{nation} फ़ेडरेशन ने आपको आपकी ज़िम्मेदारियों से मुक्त कर दिया है।",
    },
    resigned: {
      title: "आपने इस्तीफ़ा दे दिया",
      body: "आप {nation} के हेड कोच पद से हट गए हैं।",
    },
    notRenewed: {
      title: "अनुबंध का नवीनीकरण नहीं हुआ",
      body: "{nation} फ़ेडरेशन ने आपका अनुबंध नवीनीकृत न करने का फ़ैसला किया है।",
    },
    renewed: {
      title: "अनुबंध नवीनीकृत",
      body: "{nation} फ़ेडरेशन ने आपका अनुबंध {date} तक नवीनीकृत कर दिया है।",
    },
    extended: {
      title: "एक साल और",
      body: "{nation} फ़ेडरेशन ने आपका अनुबंध सिर्फ़ एक साल बढ़ाया है। वे प्रगति देखना चाहते हैं।",
    },
    coachChange: {
      title: "{nation} ने कोच बदला",
      body: "{nation} ने {coach} को अपना नया हेड कोच नियुक्त किया है।",
    },
    coachSacked: {
      title: "{nation} ने {coach} को हटाया",
      body: "खराब दौर के बाद {nation} ने हेड कोच {coach} से नाता तोड़ लिया है। उत्तराधिकारी की तलाश शुरू हो गई है।",
    },
    coachRetired: {
      title: "{coach} रिटायर",
      body: "{coach} {nation} के हेड कोच पद से हट गए हैं और कोचिंग से रिटायर हो गए हैं।",
    },
    offer: {
      title: "नौकरी का प्रस्ताव: {nation}",
      body: "{nation} फ़ेडरेशन आपको अपना नया हेड कोच बनाना चाहता है। प्रस्ताव {date} तक मान्य है।",
    },
    newJob: {
      title: "नई नौकरी: {nation}",
      body: "आप {nation} के नए हेड कोच हैं।",
    },
    tourney: {
      through: "{comp}: आगे बढ़े",
      throughTo: "हम {round} में पहुँच गए हैं।",
      throughBare: "हम आगे बढ़ गए हैं।",
      out: "{comp}: बाहर",
      groupOut: "हम {group} में आगे बढ़े बिना खत्म हुए।",
      knockedOut: "हम {round} में बाहर हो गए।",
      runnersUp: "{comp}: उपविजेता",
      lostFinal: "हम फ़ाइनल हार गए।",
    },
    qualified: {
      title: "{finals} के लिए क्वालीफ़ाई",
      body: "हमने {finals} में जगह पक्की कर ली है।",
    },
    playoff: {
      title: "प्ले-ऑफ़ में",
      body: "हम {finals} के लिए इंटर-कॉन्फ़ेडरेशन प्ले-ऑफ़ में पहुँच गए हैं।",
    },
    missedOut: {
      title: "क्वालीफ़ाई नहीं कर सके",
      body: "हम {finals} से चूक गए।",
    },
    finalsGeneric: "फ़ाइनल्स",
    injury: {
      title: "{name} चोटिल",
      body: "{name} को क्लब स्तर पर {injury} हुई है और वे {date} तक बाहर रहेंगे।",
    },
    newClub: "एक नया क्लब",
    bigMove: {
      title: "{name} को बड़ा ट्रांसफ़र मिला",
      body: "अंतरराष्ट्रीय सफलता के दम पर {name} {club} से जुड़ गए हैं।",
    },
    move: {
      title: "{name} नए क्लब में",
      body: "{name} {club} से जुड़ गए हैं।",
    },
    prospects: {
      title: "इस सीज़न आपके उभरते खिलाड़ी",
      body: "आप जिन युवाओं पर नज़र रख रहे हैं उनका विकास कैसा रहा: {list}।",
    },
    season: {
      title: "सीज़न {from}–{to} शुरू",
      body: "पिछले सीज़न में खिलाड़ियों का विकास हुआ है और गर्मियों की ट्रांसफ़र विंडो बंद हो चुकी है।",
    },
    retired: {
      entry: "{name} ({pos}, {age})",
      entryCaps: "{name} ({pos}, {age}, {caps} कैप)",
    },
    retire: {
      title: "{name} ने अंतरराष्ट्रीय फ़ुटबॉल छोड़ा",
      body: "{name} ({age}, {caps} कैप) ने अंतरराष्ट्रीय फ़ुटबॉल से संन्यास की घोषणा की है।",
    },
    wonderkid: {
      title: "वंडरकिड उभरा: {name}",
      body: "स्काउट {name} के दीवाने हैं, जो {club} में खेलने वाले {age} साल के {pos} हैं।",
    },
    newgen: {
      entry: "{name} ({pos}, {age}, {club})",
    },
    retiredMany: {
      title: "{n} खिलाड़ी रिटायर",
      body: "इन खिलाड़ियों ने अपने बूट टाँग दिए हैं: {list}।",
    },
    newgens: {
      title: "{n} युवा उभरकर आए",
      body: "हमारे लिए योग्य नई पीढ़ी: {list}।",
    },
    stadium: {
      build: {
        title: "{stadium} पर काम शुरू",
        body: "फ़ेडरेशन {city} में {seats} सीटों का स्टेडियम बना रहा है, जो {date} को खुलेगा।",
      },
      expand: {
        title: "{stadium} का विस्तार होगा",
        body: "{city} का {stadium} काम पूरा होने पर {date} को {seats} सीटों का हो जाएगा।",
      },
      opened: {
        build: "{nation} ने {stadium} खोला",
        expand: "{stadium} का विस्तार हुआ",
        body: "{city} का {stadium} अब {seats} सीटों का है{ready}।",
      },
      readyFor: ", {comp} के लिए तैयार",
    },
    champions: {
      title: "{winner} ने {comp} जीता",
      body: "{winner} चैंपियन बने{beat}।",
      beat: ", फ़ाइनल में {runnerUp} को हराकर",
    },
    draw: {
      title: "{comp}: {stage}",
      group: "ड्रॉ हो गया। हमारा सामना {others} से होगा।",
      tie: "हमारा ड्रॉ {opp} के खिलाफ़ निकला है।",
    },
    and: "{a} और {b}",
    host: {
      title: "{list} करेगा {comp} की मेज़बानी",
      one: "{list} {comp} की मेज़बानी करेगा, जो {date} से शुरू होगा।",
      many: "{list} मिलकर {comp} की मेज़बानी करेंगे, जो {date} से शुरू होगा।",
    },
    placeholder: {
      title: "{team} ने अपनी जगह ली",
      body: "{team} ने {label} जीता और ड्रॉ में वह जगह भर दी।",
    },
  },
  ms: {
    trophy: "आपकी पहली ट्रॉफ़ी: {comp}।",
    world: "विश्व चैंपियन! {nation} ने {comp} जीता।",
    continental: "आपके महाद्वीप के चैंपियन: {comp}।",
    qualification: "आप {nation} को एक बड़े टूर्नामेंट में ले गए हैं।",
    worldCup: "आप {nation} को वर्ल्ड कप में ले गए हैं।",
    firstWin: "अंतरराष्ट्रीय हेड कोच के रूप में आपकी पहली जीत।",
    matches: "अंतरराष्ट्रीय हेड कोच के रूप में {n} मैच।",
    debuts: "आपके अधीन {n} खिलाड़ियों ने पहला कैप जीता है।",
    youthDebuts: "21 साल या उससे कम उम्र के पाँच खिलाड़ियों ने अंतरराष्ट्रीय स्तर पर पदार्पण किया।",
    unbeaten: "दस प्रतिस्पर्धी मैचों में अजेय।",
    top10: "आपके अधीन {nation} दुनिया की शीर्ष दस टीमों में है।",
    no1: "{nation} दुनिया की सर्वश्रेष्ठ टीम है।",
  },
  review: {
    reached: {
      champions: "चैंपियन",
      knockedOut: "बाहर हुए",
      qualified: "क्वालीफ़ाई किया",
      notQualified: "क्वालीफ़ाई नहीं कर सके",
      leagueStage: "लीग चरण",
      promoted: "लीग {letter} में प्रमोट हुए",
      relegated: "लीग {letter} में रेलीगेट हुए",
      stayed: "लीग {letter} में बने रहे",
      runnersUp: "उपविजेता",
      groups: "ग्रुप चरण",
    },
    msg: {
      delightedChampion:
        "फ़ेडरेशन बेहद खुश है। {comp} जीतना किसी की उम्मीद से भी बढ़कर है, और आपकी साख कभी इतनी ऊँची नहीं रही।",
      delighted: "फ़ेडरेशन {comp} से बेहद खुश है। आपने उन्हें उम्मीद से कहीं ज़्यादा दिया है।",
      satisfied: "फ़ेडरेशन {comp} से संतुष्ट है। काम हो गया; अब वे चाहते हैं कि आप इसे आगे बढ़ाएँ।",
      disappointed:
        "फ़ेडरेशन {comp} से निराश है। उन्हें इससे ज़्यादा की उम्मीद थी, और उनका धैर्य अनंत नहीं है।",
      ultimatum:
        "{comp} के बाद फ़ेडरेशन का धैर्य खत्म हो गया है। नतीजे तुरंत सुधरने चाहिए, वरना वे किसी ऐसे को ढूँढ लेंगे जो नतीजे दे सके।",
      sacked:
        "{comp} आखिरी तिनका साबित हुआ। फ़ेडरेशन ने आपको आपकी ज़िम्मेदारियों से मुक्त करने का फ़ैसला किया है।",
      contractEnd:
        "{comp} के साथ आपका अनुबंध खत्म होता है, और फ़ेडरेशन ने इसे नवीनीकृत न करने का फ़ैसला किया है।",
    },
  },
  fx: {
    friendly: "अंतरराष्ट्रीय दोस्ताना मैच",
    window: "अंतरराष्ट्रीय विंडो",
    matchday: "{stage} · मैचडे {n}",
    groupMatchday: "{stage} · {group} · मैचडे {n}",
    round: "{round}",
    stageRound: "{stage} · {round}",
    roundLeg: "{round} · चरण {leg}",
    stageRoundLeg: "{stage} · {round} · चरण {leg}",
  },
  lineup: {
    nobody: "{pos} पर कोई नहीं खेल रहा",
    notInSquad: "{name} ({pos}) स्क्वाड में नहीं है",
    injured: "{name} ({pos}) चोटिल है ({label})",
    suspended: "{name} ({pos}) निलंबित है",
  },
  placeholder: {
    uefa: "UEFA प्ले-ऑफ़ पाथ {path}",
    path: "प्ले-ऑफ़ पाथ {path}",
    tournament: "प्ले-ऑफ़ टूर्नामेंट",
    qualifier: "क्वालीफ़ायर {n}",
    winner: "{base} विजेता",
    tournamentWinner: "प्ले-ऑफ़ टूर्नामेंट विजेता {n}",
    shortIc: "IC {n}",
    shortPo: "PO {path}",
  },
  injury: {
    "hamstring-strain": "हैमस्ट्रिंग में खिंचाव",
    "ankle-sprain": "टखने में मोच",
    "calf-strain": "पिंडली में खिंचाव",
    "groin-strain": "कमर के जोड़ में खिंचाव",
    "thigh-strain": "जाँघ में खिंचाव",
    "knee-injury": "घुटने की चोट",
    "broken-foot": "पैर में फ़्रैक्चर",
    "cruciate-ligament-rupture": "क्रूशिएट लिगामेंट फटना",
    knock: "हल्की चोट",
  },
  stage: {
    group: "ग्रुप {name}",
    league: "लीग",
    leagueN: "लीग {x}",
    roundOf: "अंतिम {n} का दौर",
    "round-of-16": "अंतिम 16 का दौर",
    "round-of-32": "अंतिम 32 का दौर",
    "quarter-finals": "क्वार्टर-फ़ाइनल",
    "semi-finals": "सेमीफ़ाइनल",
    final: "फ़ाइनल",
    finals: "फ़ाइनल्स",
    "third-place": "तीसरा स्थान",
    "bronze-final": "कांस्य फ़ाइनल",
    "group-stage": "ग्रुप चरण",
    "knockout-stage": "नॉकआउट चरण",
    "league-phase": "लीग चरण",
    qualifying: "क्वालीफ़ाइंग",
    "preliminary-round": "प्रारंभिक दौर",
    preliminaryN: "प्रारंभिक दौर {n}",
    prelims: "प्रीलिम्स",
    "first-round": "पहला दौर",
    "second-round": "दूसरा दौर",
    "third-round": "तीसरा दौर",
    "fourth-round": "चौथा दौर",
    "fifth-round": "पाँचवाँ दौर",
    "final-round": "अंतिम दौर",
    "play-offs": "प्ले-ऑफ़",
    "play-in": "प्ले-इन",
    "play-off-round": "प्ले-ऑफ़ दौर",
    "play-off-semi-finals": "प्ले-ऑफ़ सेमीफ़ाइनल",
    "play-off-finals": "प्ले-ऑफ़ फ़ाइनल्स",
    "play-off-final": "प्ले-ऑफ़ फ़ाइनल",
    "play-off-tournament": "प्ले-ऑफ़ टूर्नामेंट",
    "promotion-relegation-play-offs": "प्रमोशन/रेलीगेशन प्ले-ऑफ़",
    "league-a-quarter-finals": "लीग A क्वार्टर-फ़ाइनल",
    "league-a-finals": "लीग A फ़ाइनल्स",
    "league-b-finals": "लीग B फ़ाइनल्स",
    "league-c-finals": "लीग C फ़ाइनल्स",
  },
  comp: {
    wc: {
      name: "वर्ल्ड कप {year}",
      short: "वर्ल्ड कप",
      plain: "वर्ल्ड कप",
    },
    "wcq-uefa": {
      name: "वर्ल्ड कप {year} क्वालीफ़ाइंग · UEFA",
      short: "WCQ यूरोप",
      plain: "वर्ल्ड कप क्वालीफ़ाइंग · UEFA",
    },
    "wcq-caf": {
      name: "वर्ल्ड कप {year} क्वालीफ़ाइंग · CAF",
      short: "WCQ अफ़्रीका",
      plain: "वर्ल्ड कप क्वालीफ़ाइंग · CAF",
    },
    "wcq-afc": {
      name: "वर्ल्ड कप {year} क्वालीफ़ाइंग · AFC",
      short: "WCQ एशिया",
      plain: "वर्ल्ड कप क्वालीफ़ाइंग · AFC",
    },
    "wcq-concacaf": {
      name: "वर्ल्ड कप {year} क्वालीफ़ाइंग · CONCACAF",
      short: "WCQ CONCACAF",
      plain: "वर्ल्ड कप क्वालीफ़ाइंग · CONCACAF",
    },
    "wcq-conmebol": {
      name: "वर्ल्ड कप {year} क्वालीफ़ाइंग · CONMEBOL",
      short: "WCQ दक्षिण अमेरिका",
      plain: "वर्ल्ड कप क्वालीफ़ाइंग · CONMEBOL",
    },
    "wcq-ofc": {
      name: "वर्ल्ड कप {year} क्वालीफ़ाइंग · OFC",
      short: "WCQ ओशिनिया",
      plain: "वर्ल्ड कप क्वालीफ़ाइंग · OFC",
    },
    "wcq-ic": {
      name: "वर्ल्ड कप {year} प्ले-ऑफ़ टूर्नामेंट",
      short: "प्ले-ऑफ़",
      plain: "वर्ल्ड कप प्ले-ऑफ़ टूर्नामेंट",
    },
    euro: {
      name: "UEFA यूरो {year}",
      short: "यूरो",
      plain: "UEFA यूरो",
    },
    euroq: {
      name: "UEFA यूरो {year} क्वालीफ़ाइंग",
      short: "यूरो क्वालीफ़ाइंग",
      plain: "UEFA यूरो क्वालीफ़ाइंग",
    },
    unl: {
      name: "UEFA नेशंस लीग {year}–{year2}",
      short: "नेशंस लीग",
      plain: "UEFA नेशंस लीग",
    },
    finalissima: {
      name: "फ़ाइनलिसिमा {year}",
      short: "फ़ाइनलिसिमा",
      plain: "फ़ाइनलिसिमा",
    },
    afcon: {
      name: "अफ़्रीका कप ऑफ़ नेशंस {year}",
      short: "AFCON",
      plain: "अफ़्रीका कप ऑफ़ नेशंस",
    },
    afconq: {
      name: "अफ़्रीका कप ऑफ़ नेशंस {year} क्वालीफ़ाइंग",
      short: "AFCON क्वालीफ़ाइंग",
      plain: "अफ़्रीका कप ऑफ़ नेशंस क्वालीफ़ाइंग",
    },
    "asian-cup": {
      name: "AFC एशियन कप {year}",
      short: "एशियन कप",
      plain: "AFC एशियन कप",
    },
    "asian-cupq": {
      name: "AFC एशियन कप {year} क्वालीफ़ाइंग",
      short: "एशियन कप क्वालीफ़ाइंग",
      plain: "AFC एशियन कप क्वालीफ़ाइंग",
    },
    copa: {
      name: "कोपा अमेरिका {year}",
      short: "कोपा अमेरिका",
      plain: "कोपा अमेरिका",
    },
    "ofc-cup": {
      name: "OFC नेशंस कप {year}",
      short: "OFC नेशंस कप",
      plain: "OFC नेशंस कप",
    },
    cnl: {
      name: "CONCACAF नेशंस लीग {year}–{year2}",
      short: "CONCACAF NL",
      plain: "CONCACAF नेशंस लीग",
    },
    gcq: {
      name: "CONCACAF गोल्ड कप {year} प्रीलिम्स",
      short: "गोल्ड कप प्रीलिम्स",
      plain: "CONCACAF गोल्ड कप प्रीलिम्स",
    },
    "gold-cup": {
      name: "CONCACAF गोल्ड कप {year}",
      short: "गोल्ड कप",
      plain: "CONCACAF गोल्ड कप",
    },
    "arab-cup": {
      name: "अरब कप {year}",
      short: "अरब कप",
      plain: "अरब कप",
    },
    "gulf-cup": {
      name: "अरेबियन गल्फ़ कप {year}",
      short: "गल्फ़ कप",
      plain: "अरेबियन गल्फ़ कप",
    },
    aff: {
      name: "ASEAN चैंपियनशिप {year}",
      short: "ASEAN चैंपियनशिप",
      plain: "ASEAN चैंपियनशिप",
    },
    "asean-cup": {
      name: "ASEAN कप {year}",
      short: "ASEAN कप",
      plain: "ASEAN कप",
    },
    "asean-challenge": {
      name: "ASEAN चैलेंज कप {year}",
      short: "ASEAN चैलेंज कप",
      plain: "ASEAN चैलेंज कप",
    },
    "inv-mar": {
      name: "मार्च इन्विटेशनल {year}",
      short: "मार्च इन्विटेशनल",
      plain: "मार्च इन्विटेशनल",
    },
    "inv-jun": {
      name: "जून इन्विटेशनल {year}",
      short: "जून इन्विटेशनल",
      plain: "जून इन्विटेशनल",
    },
    "inv-sep": {
      name: "शरद इन्विटेशनल {year}",
      short: "शरद इन्विटेशनल",
      plain: "शरद इन्विटेशनल",
    },
    "inv-nov": {
      name: "नवंबर इन्विटेशनल {year}",
      short: "नवंबर इन्विटेशनल",
      plain: "नवंबर इन्विटेशनल",
    },
    e1: {
      name: "EAFF E-1 चैंपियनशिप {year}",
      short: "E-1",
      plain: "EAFF E-1 चैंपियनशिप",
    },
    cafa: {
      name: "CAFA नेशंस कप {year}",
      short: "CAFA नेशंस कप",
      plain: "CAFA नेशंस कप",
    },
    waff: {
      name: "WAFF चैंपियनशिप {year}",
      short: "WAFF चैंपियनशिप",
      plain: "WAFF चैंपियनशिप",
    },
    saff: {
      name: "SAFF चैंपियनशिप {year}",
      short: "SAFF चैंपियनशिप",
      plain: "SAFF चैंपियनशिप",
    },
    cosafa: {
      name: "COSAFA कप {year}",
      short: "COSAFA कप",
      plain: "COSAFA कप",
    },
    cecafa: {
      name: "CECAFA सीनियर चैलेंज कप {year}",
      short: "CECAFA कप",
      plain: "CECAFA सीनियर चैलेंज कप",
    },
    wafu: {
      name: "WAFU ज़ोन कप {year}",
      short: "WAFU कप",
      plain: "WAFU ज़ोन कप",
    },
    baltic: {
      name: "बाल्टिक कप {year}",
      short: "बाल्टिक कप",
      plain: "बाल्टिक कप",
    },
  },
  role: {
    stopper: {
      label: "स्टॉपर",
      blurb: "गेंद छीनने के लिए आगे बढ़ता है और हर हेडर जीतता है; गेंद के साथ कम मदद।",
    },
    "ball-playing": {
      label: "बॉल-प्लेइंग डिफ़ेंडर",
      blurb: "गेंद के साथ मिडफ़ील्ड में उतरता है; टैकल में हल्का।",
    },
    cover: {
      label: "कवर डिफ़ेंडर",
      blurb: "पीछे और सुरक्षित रहता है; कम फ़ाउल करता है, कम ही हमला शुरू करता है।",
    },
    "defensive-full-back": {
      label: "डिफ़ेंसिव फ़ुल-बैक",
      blurb: "अपनी लाइन पर डटा रहता है और टैकल करता है; आगे नहीं जाता।",
    },
    "wing-back": {
      label: "विंग-बैक",
      blurb: "पूरी flank पर दौड़ता है, क्रॉस और शॉट लगाता है; पीछे जगह छोड़ देता है।",
    },
    "inverted-full-back": {
      label: "इनवर्टेड फ़ुल-बैक",
      blurb: "खेल बनाने के लिए मिडफ़ील्ड में सिमट आता है; flank छोड़ देता है।",
    },
    anchor: {
      label: "एंकर",
      blurb: "डिफ़ेंस के सामने बैठता है; उसे ढकता है और खेल सरल रखता है।",
    },
    "ball-winner": {
      label: "बॉल विनर",
      blurb: "पूरे मिडफ़ील्ड में गेंद का शिकार करता है और इसमें फ़ाउल भी करता है।",
    },
    "deep-playmaker": {
      label: "डीप प्लेमेकर",
      blurb: "पीछे से खेल चलाता है; डिफ़ेंस को कम कवर मिलता है।",
    },
    "box-to-box": {
      label: "बॉक्स-टू-बॉक्स",
      blurb: "पूरा मैदान नापता है और देर से बॉक्स में पहुँचता है।",
    },
    playmaker: {
      label: "प्लेमेकर",
      blurb: "टेम्पो तय करता है और घातक पास ढूँढता है; डिफ़ेंड कम करता है।",
    },
    destroyer: {
      label: "डिस्ट्रॉयर",
      blurb: "खेल बिगाड़ता है और अक्सर फ़ाउल करता है; आगे बढ़ने में कम योगदान।",
    },
    "advanced-playmaker": {
      label: "एडवांस्ड प्लेमेकर",
      blurb: "लाइनों के बीच खेलकर मौके बनाता है; खुद कम गोल करता है।",
    },
    "shadow-striker": {
      label: "शैडो स्ट्राइकर",
      blurb: "फ़ॉरवर्ड के पीछे से दौड़ता है और शॉट लगाता है; मौके कम बनाता है।",
    },
    tracker: {
      label: "ट्रैकर",
      blurb: "आगे से प्रेस करता है और पीछे लौटकर मार्क करता है; खतरा कम।",
    },
    winger: {
      label: "विंगर",
      blurb: "टचलाइन से चिपककर क्रॉस देता है।",
    },
    "inside-forward": {
      label: "इनसाइड फ़ॉरवर्ड",
      blurb: "अंदर काटकर शॉट लगाता है; चौड़ाई और क्रॉस कम।",
    },
    "tracking-winger": {
      label: "ट्रैकिंग विंगर",
      blurb: "फ़ुल-बैक की मदद के लिए पीछे लौटता है; आगे कम जाता है।",
    },
    "target-man": {
      label: "टारगेट मैन",
      blurb: "हेडर जीतता है और गेंद रोके रखता है; सबसे तेज़ फ़िनिशर नहीं।",
    },
    poacher: {
      label: "पोचर",
      blurb: "बॉक्स में मौकों का इंतज़ार करता है; इसके अलावा कुछ नहीं करता।",
    },
    "complete-forward": {
      label: "कंप्लीट फ़ॉरवर्ड",
      blurb: "गोल करता है, तालमेल बनाता है और मौके रचता है।",
    },
    "pressing-forward": {
      label: "प्रेसिंग फ़ॉरवर्ड",
      blurb: "आगे से डिफ़ेंडरों को परेशान करता है; बॉक्स में खतरा कम।",
    },
  },
  arch: {
    "shot-stopper": {
      label: "शॉट-स्टॉपर",
      blurb: "अपनी लाइन पर राज करता है और वो भी बचा लेता है जो नहीं बचना चाहिए।",
    },
    "sweeper-keeper": {
      label: "स्वीपर-कीपर",
      blurb: "डिफ़ेंस के पीछे सफ़ाई करता है और हमले शुरू करता है; लाइन पर थोड़ा कम भरोसेमंद।",
    },
    stopper: {
      label: "स्टॉपर",
      blurb: "भिड़ंत जीतता है और हेडर से गेंद साफ़ करता है, पर बिल्ड-अप में कम योगदान।",
    },
    "ball-playing-defender": {
      label: "बॉल-प्लेइंग डिफ़ेंडर",
      blurb: "पीछे से हमले शुरू करता है; टैकल में थोड़ा हल्का।",
    },
    "defensive-full-back": {
      label: "डिफ़ेंसिव फ़ुल-बैक",
      blurb: "पीछे रहता है, टैकल करता है और flank को कवर करता है।",
    },
    "attacking-full-back": {
      label: "अटैकिंग फ़ुल-बैक",
      blurb: "ओवरलैप करता है, क्रॉस देता है और बॉक्स में पहुँचता है; पीछे जगह छोड़ देता है।",
    },
    "ball-winner": {
      label: "बॉल विनर",
      blurb: "डिफ़ेंस के सामने खेल तोड़ता है और इसमें फ़ाउल भी करता है।",
    },
    "deep-playmaker": {
      label: "डीप प्लेमेकर",
      blurb: "लंबे पासों से पीछे से खेल चलाता है।",
    },
    "box-to-box": {
      label: "बॉक्स-टू-बॉक्स",
      blurb: "मैदान का हर कोना नापता है और देर से बॉक्स में पहुँचता है।",
    },
    playmaker: {
      label: "प्लेमेकर",
      blurb: "टेम्पो तय करता है और घातक पास ढूँढता है।",
    },
    creator: {
      label: "क्रिएटर",
      blurb: "लाइनों के बीच खेलता है; गोल से ज़्यादा असिस्ट।",
    },
    "shadow-striker": {
      label: "शैडो स्ट्राइकर",
      blurb: "फ़ॉरवर्ड के पीछे से दौड़ता है और खुद गोल करता है।",
    },
    winger: {
      label: "विंगर",
      blurb: "टचलाइन से चिपककर क्रॉस देता है।",
    },
    "inside-forward": {
      label: "इनसाइड फ़ॉरवर्ड",
      blurb: "विंग से अंदर काटकर शॉट लगाता है।",
    },
    "target-man": {
      label: "टारगेट मैन",
      blurb: "हेडर जीतता है और गेंद रोके रखता है; सबसे तेज़ फ़िनिशर नहीं।",
    },
    poacher: {
      label: "पोचर",
      blurb: "बॉक्स में रहता है और जो गेंद आए उसे गोल में बदलता है; और कुछ खास नहीं।",
    },
    "complete-forward": {
      label: "कंप्लीट फ़ॉरवर्ड",
      blurb: "गोल करता है, तालमेल बनाता है और मौके रचता है।",
    },
  },
  rule: {
    "behind-high-line": "ऊँची लाइन के पीछे गेंदें",
    "counter-into-deep-block": "गहरे ब्लॉक के सामने काउंटर के लिए जगह नहीं",
    "width-into-back-five": "बैक फ़ाइव के सामने चौड़ाई बेकार",
    "width-into-open-flanks": "खुली flank वाली फ़्लैट फ़ोर के सामने चौड़ाई",
    "patience-into-press": "हाई प्रेस के सामने धैर्य से बिल्ड-अप",
    "direct-past-press": "हाई प्रेस को चीरता सीधा खेल",
    "lone-striker-into-back-three": "तीन सेंटर-बैक के सामने अकेला स्ट्राइकर",
    "two-strikers-into-flat-four": "फ़्लैट फ़ोर के सामने दो स्ट्राइकर",
    "midfield-numbers": "बीच में ज़्यादा खिलाड़ी",
    "midfield-outnumbered": "बीच में संख्या में कम",
    "press-patient-side": "धैर्य से खेलने वाली टीम के सामने हाई प्रेस",
    "narrow-into-wide": "संकरी टीम चौड़ी टीम के सामने बीच में भीड़ लगाती है",
  },
  badge: {
    "big-game": {
      label: "बड़े मैच का खिलाड़ी",
      text: "फ़ाइनल और निर्णायक मैचों में अपने स्तर से ऊपर खेलता है, और पेनल्टी स्पॉट पर हौसला बनाए रखता है।",
    },
    reliable: {
      label: "भरोसेमंद",
      text: "लगभग हर मैच में अपने स्तर के अनुरूप खेलता है।",
    },
    erratic: {
      label: "अनिश्चित",
      text: "मैच रेटिंग ऊपर-नीचे होती रहती है; एक दिन शानदार, अगले दिन खराब।",
    },
    "injury-prone": {
      label: "चोट-प्रवण",
      text: "मैच में चोट लगने की संभावना ज़्यादा।",
    },
    "tires-early": {
      label: "जल्दी थकता है",
      text: "किसी युवा खिलाड़ी से जल्दी दम तोड़ देता है।",
    },
  },
  bond: {
    clubmates: "क्लब साथी",
    friends: "दोस्त",
    feud: "झगड़ा",
  },
  spirit: {
    tight: "एकजुट",
    good: "अच्छा",
    neutral: "तटस्थ",
    uneasy: "असहज",
    divided: "बँटा हुआ",
  },
  scout: {
    trait: {
      attack: "आक्रमण-प्रधान",
      cautious: "सतर्क",
      highLine: "ऊँची लाइन",
      deepLine: "गहरी लाइन",
      wide: "चौड़ा खेलते हैं",
      narrow: "संकरा खेलते हैं",
      counter: "काउंटर-अटैकिंग",
      highPress: "हाई प्रेस",
      dropsOff: "पीछे हट जाते हैं",
      direct: "सीधा",
      patient: "धैर्यपूर्ण",
      balanced: "संतुलित",
    },
    reason: {
      star: "उनका सर्वश्रेष्ठ खिलाड़ी",
      threat: "उनका मुख्य गोल का खतरा",
      creator: "उनके ज़्यादातर मौके बनाता है",
      weak: "कमज़ोर कड़ी",
    },
    level: {
      "0": "गहरी",
      "1": "मानक",
      "2": "ऊँची",
    },
    width: {
      "0": "संकरी",
      "1": "मानक",
      "2": "चौड़ी",
    },
    change: {
      line: "डिफ़ेंसिव लाइन: {from} → {to}",
      width: "चौड़ाई: {from} → {to}",
      counter: "काउंटर-अटैक: {from} → {to}",
    },
    on: "चालू",
    off: "बंद",
  },
}

export default engine
