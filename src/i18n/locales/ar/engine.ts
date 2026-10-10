import type en from "../en/engine"

const engine: typeof en = {
  obj: {
    qualify: "التأهل إلى {comp}",
    unbeaten: "{text} دون هزيمة",
    promotion: "الصعود من الدوري {letter}",
    relegation: "تفادي الهبوط من الدوري {letter}",
    win: "الفوز بـ {comp}",
    reach: {
      knockout: "بلوغ الأدوار الإقصائية في {comp}",
      "quarter-finals": "بلوغ ربع نهائي {comp}",
      "semi-finals": "بلوغ نصف نهائي {comp}",
      final: "بلوغ نهائي {comp}",
    },
    debuts: "منح {count} لاعبين بعمر 21 سنة أو أقل فرصة الظهور الدولي الأول في {year}",
    raiseNote: "المكافآت ×{reward}؛ والإخفاق يكلف {cost} من الثقة، ثم يعود الهدف الأصلي",
    lowerNote: "يكلف {cost} من الثقة الآن؛ والمكافآت تُخفَّض إلى النصف",
    lowerNeeds: "لن يستمع المجلس إلا إذا بلغت الثقة {n}% أو أكثر",
  },
  news: {
    raise: {
      title: "ترفع السقف",
      body: "لقد وعدت الاتحاد بالمزيد: «{text}». حقق ما وعدت به، ولن ينسوا ذلك.",
    },
    lower: {
      title: "تم خفض التوقعات",
      body: "وافق الاتحاد على مضض على هدف أقل: «{text}».",
    },
    broken: {
      title: "وعد منكوث",
      body: "وعدت بـ «{promised}» لكنك أخفقت. ما زال الاتحاد يتوقع منك «{target}».",
    },
    met: {
      title: "تحقق الهدف",
      body: "الاتحاد في غاية السعادة: «{text}» — تم. وسيصل الدعم الإضافي إلى الأكاديميات أيضًا.",
    },
    missed: {
      title: "أُخفق الهدف",
      body: "الاتحاد غير راضٍ: لقد أخفقنا في «{text}».",
    },
    friendly: "مباراة ودية",
    derbyWin: {
      title: "يوم الديربي لـ {us}",
      body: "فوز {score} على الغريم التقليدي {them} في {comp}. الشوارع تحتفل.",
    },
    derbyLoss: {
      title: "خسارة الديربي أمام {them}",
      body: "هُزمنا {score} أمام {them} في {comp}. لن تنسى الجماهير هذه الخسارة سريعًا.",
    },
    derbyDraw: {
      title: "تعادل في الديربي",
      body: "تعادل {us} و{them} {score} في {comp}. لا أحد منهما يحصل على حق المفاخرة.",
    },
    fans: {
      angry: {
        title: "الجماهير تنقلب على المدرب",
        body: "أعرب أنصار {nation} عن غضبهم بوضوح. والمجلس يصغي.",
      },
      adore: {
        title: "الجماهير معك",
        body: "أنصار {nation} يهتفون باسم المدرب. وسيكون الملعب مشتعلًا.",
      },
    },
    invitational: {
      title: "{host} تستضيف {comp}",
      body: "ستستضيف {host} بطولة {comp} بمشاركة {teams}. تنطلق في {date}.",
    },
    invite: {
      title: "دعوة من {host}",
      body: "تدعونا {host} إلى بطولة من {n} منتخبات في الفترة التي تبدأ في {date}. إنهم ينتظرون ردًا.",
    },
    inviteLapsed: {
      title: "انتهت صلاحية الدعوة",
      body: "لم نرد على دعوة {host} في الوقت المناسب؛ وستقام البطولة من دوننا.",
    },
    inviteOff: {
      title: "أُلغيت البطولة",
      body: "تعذر إقامة بطولة {host}: لم تعد كل المنتخبات متفرغة.",
    },
    riot: {
      title: "{us} يكتسح {them}",
      body: "فوز {score} على {them} في {comp}. ستتذكر الجماهير هذه المباراة.",
    },
    shock: {
      title: "فوز مفاجئ على {them}",
      body: "قلة منحتنا فرصة، لكننا فزنا على {them} {score} في {comp}.",
    },
    humiliation: {
      title: "إذلال أمام {them}",
      body: "هزيمة {score} أمام {them} في {comp}. التساؤلات تُطرح حول المدرب.",
    },
    embarrassing: {
      title: "خسارة محرجة أمام {them}",
      body: "كان المتوقع أن نفوز، لكننا خسرنا {score} أمام {them} في {comp}.",
    },
    cap: {
      title: "{name} يخوض مباراته الدولية رقم {caps}",
      body: "لعب {name} الآن {caps} مباراة مع {nation}.",
    },
    goals: {
      title: "{name} يصل إلى {goals} هدفًا دوليًا",
      body: "سجل {name} الآن {goals} هدفًا مع {nation}.",
    },
    debut: {
      title: "أول مباراة دولية لـ {name}",
      body: "يخوضون ظهورهم الدولي الأول ضد {opp}: {names}.",
    },
    debuts: {
      title: "{n} ظهور أول",
    },
    milestone: "تم بلوغ محطة بارزة",
    ultimatum: {
      title: "إنذار أخير",
      body: "نفد صبر الاتحاد. ارفع ثقته إلى {lifted}% خلال {matches} مباريات رسمية، وإلا ستتم إقالتك.",
    },
    eases: {
      title: "الضغط يتراجع",
      body: "تحسنت النتائج. وسحب الاتحاد إنذاره الأخير.",
    },
    sacked: {
      title: "أُقِلت",
      body: "أعفاك اتحاد {nation} من مهامك.",
    },
    resigned: {
      title: "لقد استقلت",
      body: "تركت منصبك مدربًا لمنتخب {nation}.",
    },
    notRenewed: {
      title: "لم يُجدَّد العقد",
      body: "قرر اتحاد {nation} عدم تجديد عقدك.",
    },
    renewed: {
      title: "تم تجديد العقد",
      body: "جدد اتحاد {nation} عقدك حتى {date}.",
    },
    extended: {
      title: "سنة أخرى",
      body: "مدد اتحاد {nation} عقدك لسنة واحدة فقط. إنهم يريدون رؤية تقدم.",
    },
    coachChange: {
      title: "{nation} تغيّر مدربها",
      body: "عيّنت {nation} المدرب {coach} مدربًا رئيسيًا جديدًا لها.",
    },
    coachSacked: {
      title: "{nation} تقيل {coach}",
      body: "انفصلت {nation} عن مدربها {coach} بعد سلسلة نتائج سيئة. وبدأ البحث عن خليفة.",
    },
    coachRetired: {
      title: "{coach} يعتزل",
      body: "ترك {coach} تدريب {nation} واعتزل التدريب.",
    },
    offer: {
      title: "عرض عمل: {nation}",
      body: "يرغب اتحاد {nation} في أن تكون مدربه الجديد. العرض ساري حتى {date}.",
    },
    newJob: {
      title: "وظيفة جديدة: {nation}",
      body: "أنت الآن المدرب الجديد لمنتخب {nation}.",
    },
    tourney: {
      through: "{comp}: تأهلنا",
      throughTo: "تأهلنا إلى {round}.",
      throughBare: "لقد تأهلنا.",
      out: "{comp}: خرجنا",
      groupOut: "أنهينا {group} دون التأهل.",
      knockedOut: "خرجنا من {round}.",
      runnersUp: "{comp}: وصيف",
      lostFinal: "خسرنا النهائي.",
    },
    qualified: {
      title: "التأهل إلى {finals}",
      body: "لقد حجزنا مكانًا في {finals}.",
    },
    playoff: {
      title: "إلى الملحق",
      body: "بلغنا الملحق بين القارات المؤهل إلى {finals}.",
    },
    missedOut: {
      title: "لم نتأهل",
      body: "فاتتنا فرصة التأهل إلى {finals}.",
    },
    finalsGeneric: "النهائيات",
    injury: {
      title: "إصابة {name}",
      body: "تعرض {name} لـ {injury} مع ناديه وسيغيب حتى {date}.",
    },
    newClub: "نادٍ جديد",
    bigMove: {
      title: "{name} ينال انتقالًا كبيرًا",
      body: "ينضم {name} إلى {club} بعد انطلاقته الدولية.",
    },
    move: {
      title: "{name} ينتقل",
      body: "ينضم {name} إلى {club}.",
    },
    prospects: {
      title: "مواهبك هذا الموسم",
      body: "كيف تطور الناشئون الذين تتابعهم: {list}.",
    },
    season: {
      title: "بداية موسم {from}–{to}",
      body: "تطور اللاعبون خلال الموسم الماضي وأُغلق باب الانتقالات الصيفي.",
    },
    retired: {
      entry: "{name} ({pos}، {age})",
      entryCaps: "{name} ({pos}، {age}، {caps} مباراة دولية)",
    },
    retire: {
      title: "{name} يعتزل كرة القدم الدولية",
      body: "أعلن {name} ({age} سنة، {caps} مباراة دولية) اعتزاله كرة القدم الدولية.",
    },
    wonderkid: {
      title: "ظهور موهبة فذة: {name}",
      body: "الكشافون يشيدون بـ {name}، {pos} بعمر {age} سنة في {club}.",
    },
    newgen: {
      entry: "{name} ({pos}، {age}، {club})",
    },
    retiredMany: {
      title: "اعتزال {n} لاعبين",
      body: "علّق هؤلاء اللاعبون أحذيتهم: {list}.",
    },
    newgens: {
      title: "صعود {n} من الناشئين",
      body: "الجيل الجديد المؤهل لتمثيلنا: {list}.",
    },
    stadium: {
      build: {
        title: "بدء العمل في {stadium}",
        body: "يبني الاتحاد ملعبًا بسعة {seats} مقعد في {city}، ومن المقرر افتتاحه في {date}.",
      },
      expand: {
        title: "توسعة {stadium}",
        body: "سيتسع {stadium} في {city} لـ {seats} بعد انتهاء الأعمال في {date}.",
      },
      opened: {
        build: "{nation} تفتتح {stadium}",
        expand: "اكتملت توسعة {stadium}",
        body: "يتسع {stadium} في {city} الآن لـ {seats}{ready}.",
      },
      readyFor: "، وهو جاهز لاستضافة {comp}",
    },
    champions: {
      title: "{winner} تفوز بـ {comp}",
      body: "{winner} بطلة{beat}.",
      beat: "، بعد فوزها على {runnerUp} في النهائي",
    },
    draw: {
      title: "{comp}: {stage}",
      group: "أُجريت القرعة. سنواجه {others}.",
      tie: "أوقعتنا القرعة في مواجهة {opp}.",
    },
    and: "{a} و{b}",
    host: {
      title: "{list} تستضيف {comp}",
      one: "ستستضيف {list} بطولة {comp}، بدءًا من {date}.",
      many: "ستستضيف {list} بطولة {comp} بالاشتراك، بدءًا من {date}.",
    },
    placeholder: {
      title: "{team} تحجز مكانها",
      body: "{team} تفوز بـ {label} وتشغل ذلك المقعد في القرعة.",
    },
  },
  ms: {
    trophy: "أول كأس لك: {comp}.",
    world: "أبطال العالم! {nation} تفوز بـ {comp}.",
    continental: "أبطال قارتك: {comp}.",
    qualification: "قدت {nation} إلى بطولة كبرى.",
    worldCup: "قدت {nation} إلى كأس العالم.",
    firstWin: "أول فوز لك كمدرب لمنتخب وطني.",
    matches: "{n} مباراة كمدرب لمنتخب وطني.",
    debuts: "{n} لاعبين خاضوا أول مباراة دولية لهم تحت قيادتك.",
    youthDebuts: "خمسة لاعبين بعمر 21 سنة أو أقل خاضوا غمار المستوى الدولي.",
    unbeaten: "عشر مباريات رسمية دون هزيمة.",
    top10: "{nation} ضمن أفضل عشرة منتخبات في العالم تحت قيادتك.",
    no1: "{nation} أفضل منتخب في العالم.",
  },
  review: {
    reached: {
      champions: "بطل",
      knockedOut: "خرج",
      qualified: "تأهل",
      notQualified: "لم يتأهل",
      leagueStage: "مرحلة الدوري",
      promoted: "صعد إلى الدوري {letter}",
      relegated: "هبط إلى الدوري {letter}",
      stayed: "بقي في الدوري {letter}",
      runnersUp: "وصيف",
      groups: "دور المجموعات",
    },
    msg: {
      delightedChampion:
        "الاتحاد في غاية السعادة. الفوز بـ {comp} يفوق ما تجرأ أحد على أن يأمله، ومكانتك لم تكن أعلى من الآن.",
      delighted: "الاتحاد سعيد جدًا بأدائك في {comp}. لقد منحتهم أكثر مما طلبوا.",
      satisfied: "الاتحاد راضٍ عن {comp}. أُنجزت المهمة؛ والآن يتوقعون منك البناء عليها.",
      disappointed: "الاتحاد خائب الأمل من {comp}. كانوا يتوقعون المزيد، وصبرهم ليس بلا حدود.",
      ultimatum: "بعد {comp}، نفد صبر الاتحاد. يجب أن تتحسن النتائج فورًا، وإلا سيجدون من يحققها.",
      sacked: "كانت {comp} القشة التي قصمت ظهر البعير. قرر الاتحاد إعفاءك من مهامك.",
      contractEnd: "{comp} تمثل نهاية عقدك، وقد قرر الاتحاد عدم تجديده.",
    },
  },
  fx: {
    friendly: "مباراة دولية ودية",
    window: "فترة دولية",
    matchday: "{stage} · الجولة {n}",
    groupMatchday: "{stage} · {group} · الجولة {n}",
    round: "{round}",
    stageRound: "{stage} · {round}",
    roundLeg: "{round} · مباراة {leg}",
    stageRoundLeg: "{stage} · {round} · مباراة {leg}",
  },
  lineup: {
    nobody: "لا أحد يلعب في مركز {pos}",
    notInSquad: "{name} ({pos}) ليس ضمن التشكيلة",
    injured: "{name} ({pos}) مصاب ({label})",
    suspended: "{name} ({pos}) موقوف",
  },
  placeholder: {
    uefa: "مسار الملحق الأوروبي {path}",
    path: "مسار الملحق {path}",
    tournament: "بطولة الملحق",
    qualifier: "المتأهل {n}",
    winner: "فائز {base}",
    tournamentWinner: "فائز بطولة الملحق {n}",
    shortIc: "ملحق قاري {n}",
    shortPo: "ملحق {path}",
  },
  injury: {
    "hamstring-strain": "شد في عضلة الفخذ الخلفية",
    "ankle-sprain": "التواء في الكاحل",
    "calf-strain": "شد في عضلة الساق",
    "groin-strain": "شد في الأربية",
    "thigh-strain": "شد في عضلة الفخذ",
    "knee-injury": "إصابة في الركبة",
    "broken-foot": "كسر في القدم",
    "cruciate-ligament-rupture": "قطع في الرباط الصليبي",
    knock: "ضربة",
  },
  stage: {
    group: "المجموعة {name}",
    league: "الدوري",
    leagueN: "الدوري {x}",
    roundOf: "دور الـ {n}",
    "round-of-16": "دور الـ 16",
    "round-of-32": "دور الـ 32",
    "quarter-finals": "ربع النهائي",
    "semi-finals": "نصف النهائي",
    final: "النهائي",
    finals: "النهائيات",
    "third-place": "المركز الثالث",
    "bronze-final": "نهائي البرونزية",
    "group-stage": "دور المجموعات",
    "knockout-stage": "الأدوار الإقصائية",
    "league-phase": "مرحلة الدوري",
    qualifying: "التصفيات",
    "preliminary-round": "الدور التمهيدي",
    preliminaryN: "الدور التمهيدي {n}",
    prelims: "التمهيدية",
    "first-round": "الدور الأول",
    "second-round": "الدور الثاني",
    "third-round": "الدور الثالث",
    "fourth-round": "الدور الرابع",
    "fifth-round": "الدور الخامس",
    "final-round": "الدور النهائي",
    "play-offs": "الملحق",
    "play-in": "الملحق التمهيدي",
    "play-off-round": "دور الملحق",
    "play-off-semi-finals": "نصف نهائي الملحق",
    "play-off-finals": "نهائيات الملحق",
    "play-off-final": "نهائي الملحق",
    "play-off-tournament": "بطولة الملحق",
    "promotion-relegation-play-offs": "ملحق الصعود والهبوط",
    "league-a-quarter-finals": "ربع نهائي الدوري A",
    "league-a-finals": "نهائيات الدوري A",
    "league-b-finals": "نهائيات الدوري B",
    "league-c-finals": "نهائيات الدوري C",
  },
  comp: {
    wc: {
      name: "كأس العالم {year}",
      short: "كأس العالم",
      plain: "كأس العالم",
    },
    "wcq-uefa": {
      name: "تصفيات كأس العالم {year} · أوروبا",
      short: "تصفيات أوروبا",
      plain: "تصفيات كأس العالم · أوروبا",
    },
    "wcq-caf": {
      name: "تصفيات كأس العالم {year} · أفريقيا",
      short: "تصفيات أفريقيا",
      plain: "تصفيات كأس العالم · أفريقيا",
    },
    "wcq-afc": {
      name: "تصفيات كأس العالم {year} · آسيا",
      short: "تصفيات آسيا",
      plain: "تصفيات كأس العالم · آسيا",
    },
    "wcq-concacaf": {
      name: "تصفيات كأس العالم {year} · الكونكاكاف",
      short: "تصفيات الكونكاكاف",
      plain: "تصفيات كأس العالم · الكونكاكاف",
    },
    "wcq-conmebol": {
      name: "تصفيات كأس العالم {year} · أمريكا الجنوبية",
      short: "تصفيات أمريكا الجنوبية",
      plain: "تصفيات كأس العالم · أمريكا الجنوبية",
    },
    "wcq-ofc": {
      name: "تصفيات كأس العالم {year} · أوقيانوسيا",
      short: "تصفيات أوقيانوسيا",
      plain: "تصفيات كأس العالم · أوقيانوسيا",
    },
    "wcq-ic": {
      name: "بطولة ملحق كأس العالم {year}",
      short: "الملحق",
      plain: "بطولة ملحق كأس العالم",
    },
    euro: {
      name: "كأس أمم أوروبا {year}",
      short: "يورو",
      plain: "كأس أمم أوروبا",
    },
    euroq: {
      name: "تصفيات كأس أمم أوروبا {year}",
      short: "تصفيات يورو",
      plain: "تصفيات كأس أمم أوروبا",
    },
    unl: {
      name: "دوري الأمم الأوروبية {year}–{year2}",
      short: "دوري الأمم",
      plain: "دوري الأمم الأوروبية",
    },
    finalissima: {
      name: "فيناليسيما {year}",
      short: "فيناليسيما",
      plain: "فيناليسيما",
    },
    afcon: {
      name: "كأس الأمم الأفريقية {year}",
      short: "كأس أفريقيا",
      plain: "كأس الأمم الأفريقية",
    },
    afconq: {
      name: "تصفيات كأس الأمم الأفريقية {year}",
      short: "تصفيات كأس أفريقيا",
      plain: "تصفيات كأس الأمم الأفريقية",
    },
    "asian-cup": {
      name: "كأس آسيا {year}",
      short: "كأس آسيا",
      plain: "كأس آسيا",
    },
    "asian-cupq": {
      name: "تصفيات كأس آسيا {year}",
      short: "تصفيات كأس آسيا",
      plain: "تصفيات كأس آسيا",
    },
    copa: {
      name: "كوبا أمريكا {year}",
      short: "كوبا أمريكا",
      plain: "كوبا أمريكا",
    },
    "ofc-cup": {
      name: "كأس أمم أوقيانوسيا {year}",
      short: "كأس أوقيانوسيا",
      plain: "كأس أمم أوقيانوسيا",
    },
    cnl: {
      name: "دوري أمم الكونكاكاف {year}–{year2}",
      short: "دوري الكونكاكاف",
      plain: "دوري أمم الكونكاكاف",
    },
    gcq: {
      name: "التصفيات التمهيدية للكأس الذهبية {year}",
      short: "تمهيدي الكأس الذهبية",
      plain: "التصفيات التمهيدية للكأس الذهبية",
    },
    "gold-cup": {
      name: "الكأس الذهبية للكونكاكاف {year}",
      short: "الكأس الذهبية",
      plain: "الكأس الذهبية للكونكاكاف",
    },
    "arab-cup": {
      name: "كأس العرب {year}",
      short: "كأس العرب",
      plain: "كأس العرب",
    },
    "gulf-cup": {
      name: "كأس الخليج العربي {year}",
      short: "كأس الخليج",
      plain: "كأس الخليج العربي",
    },
    aff: {
      name: "بطولة آسيان {year}",
      short: "بطولة آسيان",
      plain: "بطولة آسيان",
    },
    "asean-cup": {
      name: "كأس آسيان {year}",
      short: "كأس آسيان",
      plain: "كأس آسيان",
    },
    "asean-challenge": {
      name: "كأس تحدي آسيان {year}",
      short: "كأس تحدي آسيان",
      plain: "كأس تحدي آسيان",
    },
    "inv-mar": {
      name: "بطولة مارس الودية {year}",
      short: "بطولة مارس الودية",
      plain: "بطولة مارس الودية",
    },
    "inv-jun": {
      name: "بطولة يونيو الودية {year}",
      short: "بطولة يونيو الودية",
      plain: "بطولة يونيو الودية",
    },
    "inv-sep": {
      name: "بطولة الخريف الودية {year}",
      short: "بطولة الخريف الودية",
      plain: "بطولة الخريف الودية",
    },
    "inv-nov": {
      name: "بطولة نوفمبر الودية {year}",
      short: "بطولة نوفمبر الودية",
      plain: "بطولة نوفمبر الودية",
    },
    e1: {
      name: "بطولة شرق آسيا E-1 {year}",
      short: "E-1",
      plain: "بطولة شرق آسيا E-1",
    },
    cafa: {
      name: "كأس أمم آسيا الوسطى (كافا) {year}",
      short: "كأس كافا",
      plain: "كأس أمم آسيا الوسطى (كافا)",
    },
    waff: {
      name: "بطولة غرب آسيا {year}",
      short: "بطولة غرب آسيا",
      plain: "بطولة غرب آسيا",
    },
    saff: {
      name: "بطولة جنوب آسيا {year}",
      short: "بطولة جنوب آسيا",
      plain: "بطولة جنوب آسيا",
    },
    cosafa: {
      name: "كأس كوسافا {year}",
      short: "كأس كوسافا",
      plain: "كأس كوسافا",
    },
    cecafa: {
      name: "كأس سيكافا للكبار {year}",
      short: "كأس سيكافا",
      plain: "كأس سيكافا للكبار",
    },
    wafu: {
      name: "كأس منطقة واتحاد غرب أفريقيا {year}",
      short: "كأس واتحاد غرب أفريقيا",
      plain: "كأس منطقة واتحاد غرب أفريقيا",
    },
    baltic: {
      name: "كأس البلطيق {year}",
      short: "كأس البلطيق",
      plain: "كأس البلطيق",
    },
  },
  role: {
    stopper: {
      label: "مدافع قاطع",
      blurb: "يتقدم لافتكاك الكرة ويحسم الكرات الهوائية؛ مساهمته أقل بالكرة.",
    },
    "ball-playing": {
      label: "مدافع صانع لعب",
      blurb: "يتقدم إلى الوسط بالكرة؛ أخف في الافتكاك.",
    },
    cover: {
      label: "مدافع تغطية",
      blurb: "يبقى في العمق بأمان؛ نادرًا ما يرتكب الأخطاء ونادرًا ما يبدأ الهجمة.",
    },
    "defensive-full-back": {
      label: "ظهير دفاعي",
      blurb: "يحافظ على خطه ويفتك الكرات؛ لا يتقدم للهجوم.",
    },
    "wing-back": {
      label: "ظهير جناح",
      blurb: "يقطع الطرف كله، يعرض ويسدد؛ ويترك مساحة خلفه.",
    },
    "inverted-full-back": {
      label: "ظهير مقلوب",
      blurb: "ينكمش نحو الوسط لبناء اللعب؛ ويترك الطرف.",
    },
    anchor: {
      label: "لاعب ارتكاز",
      blurb: "يقف أمام الدفاع؛ يحميه ويبقي اللعب بسيطًا.",
    },
    "ball-winner": {
      label: "مستخلص الكرة",
      blurb: "يطارد الكرة في أنحاء الوسط ويرتكب الأخطاء في ذلك.",
    },
    "deep-playmaker": {
      label: "صانع ألعاب متراجع",
      blurb: "يتحكم باللعب من العمق؛ تغطية أقل للدفاع.",
    },
    "box-to-box": {
      label: "لاعب وسط شامل",
      blurb: "يغطي الملعب كله ويصل متأخرًا إلى المنطقة.",
    },
    playmaker: {
      label: "صانع ألعاب",
      blurb: "يضبط الإيقاع ويجد التمريرة القاتلة؛ يدافع أقل.",
    },
    destroyer: {
      label: "مدمر الهجمات",
      blurb: "يقطع اللعب ويرتكب الأخطاء كثيرًا؛ يضيف القليل للهجوم.",
    },
    "advanced-playmaker": {
      label: "صانع ألعاب متقدم",
      blurb: "يلعب بين الخطوط ويصنع الفرص؛ يسجل أقل بنفسه.",
    },
    "shadow-striker": {
      label: "مهاجم ظل",
      blurb: "ينطلق من خلف المهاجم ويسدد؛ يصنع أقل.",
    },
    tracker: {
      label: "لاعب متابعة",
      blurb: "يضغط من الأمام ويعود للتغطية؛ خطورة أقل.",
    },
    winger: {
      label: "جناح",
      blurb: "يلتصق بالخط الجانبي ويرسل العرضيات.",
    },
    "inside-forward": {
      label: "جناح مقلوب",
      blurb: "يقطع للداخل ليسدد؛ عرض أقل وعرضيات أقل.",
    },
    "tracking-winger": {
      label: "جناح مساند",
      blurb: "يعود لمساعدة الظهير؛ تقدمه للهجوم أقل.",
    },
    "target-man": {
      label: "مهاجم مرتكز",
      blurb: "يفوز بالكرات الرأسية ويحتفظ بالكرة؛ ليس الأدق إنهاءً.",
    },
    poacher: {
      label: "قناص",
      blurb: "ينتظر الفرص داخل المنطقة؛ ولا يفعل شيئًا آخر.",
    },
    "complete-forward": {
      label: "مهاجم متكامل",
      blurb: "يسجل ويربط اللعب ويصنع.",
    },
    "pressing-forward": {
      label: "مهاجم ضاغط",
      blurb: "يلاحق المدافعين من الأمام؛ خطورة أقل داخل المنطقة.",
    },
  },
  arch: {
    "shot-stopper": {
      label: "متصدٍّ للتسديدات",
      blurb: "يسيطر على خط مرماه ويتصدى لما يصعب التصدي له.",
    },
    "sweeper-keeper": {
      label: "حارس مكنسة",
      blurb: "يكنس خلف الدفاع ويبدأ الهجمات؛ أقل ثقة قليلًا على خط المرمى.",
    },
    stopper: {
      label: "مدافع قاطع",
      blurb: "يفوز بالالتحامات ويبعد الكرات الهوائية، لكنه يضيف القليل في بناء اللعب.",
    },
    "ball-playing-defender": {
      label: "مدافع صانع لعب",
      blurb: "يبدأ الهجمات من الخلف؛ أخف قليلًا في الافتكاك.",
    },
    "defensive-full-back": {
      label: "ظهير دفاعي",
      blurb: "يبقى في الخلف، يفتك الكرات ويغطي الجناح.",
    },
    "attacking-full-back": {
      label: "ظهير هجومي",
      blurb: "يتجاوز الجناح، يعرض ويدخل المنطقة؛ ويترك مساحة خلفه.",
    },
    "ball-winner": {
      label: "مستخلص الكرة",
      blurb: "يقطع اللعب أمام الدفاع ويرتكب الأخطاء في ذلك.",
    },
    "deep-playmaker": {
      label: "صانع ألعاب متراجع",
      blurb: "يتحكم باللعب من العمق بتمريرات طويلة.",
    },
    "box-to-box": {
      label: "لاعب وسط شامل",
      blurb: "يغطي كل شبر من الملعب ويصل متأخرًا إلى المنطقة.",
    },
    playmaker: {
      label: "صانع ألعاب",
      blurb: "يضبط الإيقاع ويجد التمريرة القاتلة.",
    },
    creator: {
      label: "مبدع",
      blurb: "يلعب بين الخطوط؛ تمريراته الحاسمة أكثر من أهدافه.",
    },
    "shadow-striker": {
      label: "مهاجم ظل",
      blurb: "ينطلق من خلف المهاجم ويسجل بنفسه.",
    },
    winger: {
      label: "جناح",
      blurb: "يلتصق بالخط الجانبي ويرسل العرضيات.",
    },
    "inside-forward": {
      label: "جناح مقلوب",
      blurb: "يقطع من الجناح إلى الداخل ليسدد.",
    },
    "target-man": {
      label: "مهاجم مرتكز",
      blurb: "يفوز بالكرات الرأسية ويحتفظ بالكرة؛ ليس الأدق إنهاءً.",
    },
    poacher: {
      label: "قناص",
      blurb: "يعيش في المنطقة ويُنهي ما يصله؛ وقليل غير ذلك.",
    },
    "complete-forward": {
      label: "مهاجم متكامل",
      blurb: "يسجل ويربط اللعب ويصنع.",
    },
  },
  rule: {
    "behind-high-line": "كرات خلف خط دفاع متقدم",
    "counter-into-deep-block": "لا مساحة للمرتدة أمام دفاع متراجع",
    "width-into-back-five": "العرض بلا فائدة أمام خمسة مدافعين",
    "width-into-open-flanks": "العرض أمام رباعي دفاع مسطح بأطراف مكشوفة",
    "patience-into-press": "بناء هادئ أمام ضغط عالٍ",
    "direct-past-press": "لعب مباشر لتجاوز الضغط العالي",
    "lone-striker-into-back-three": "مهاجم وحيد أمام ثلاثة قلوب دفاع",
    "two-strikers-into-flat-four": "مهاجمان أمام رباعي دفاع مسطح",
    "midfield-numbers": "عدد أكبر من اللاعبين في العمق",
    "midfield-outnumbered": "نقص عددي في العمق",
    "press-patient-side": "ضغط عالٍ أمام فريق هادئ",
    "narrow-into-wide": "فريق ضيق يكتظ في العمق أمام فريق عريض",
  },
  badge: {
    "big-game": {
      label: "لاعب المباريات الكبرى",
      text: "يرتقي فوق مستواه في النهائيات والمباريات الحاسمة، ويحافظ على هدوئه من نقطة الجزاء.",
    },
    reliable: {
      label: "موثوق",
      text: "يقدم مستواه في كل مباراة تقريبًا.",
    },
    erratic: {
      label: "متقلب",
      text: "تتأرجح تقييماته؛ رائع يومًا وضعيف في اليوم التالي.",
    },
    "injury-prone": {
      label: "عرضة للإصابة",
      text: "أكثر احتمالًا لتعرضه لضربة في المباراة.",
    },
    "tires-early": {
      label: "يتعب مبكرًا",
      text: "ينفد نفسه أسرع من اللاعب الأصغر سنًا.",
    },
  },
  bond: {
    clubmates: "زملاء النادي",
    friends: "أصدقاء",
    feud: "خصومة",
  },
  spirit: {
    tight: "متماسك",
    good: "جيد",
    neutral: "محايد",
    uneasy: "قلق",
    divided: "منقسم",
  },
  scout: {
    trait: {
      attack: "ميّال للهجوم",
      cautious: "حذر",
      highLine: "خط دفاع متقدم",
      deepLine: "خط دفاع متراجع",
      wide: "يلعب عريضًا",
      narrow: "يلعب ضيقًا",
      counter: "هجمات مرتدة",
      highPress: "ضغط عالٍ",
      dropsOff: "يتراجع",
      direct: "مباشر",
      patient: "هادئ",
      balanced: "متوازن",
    },
    reason: {
      star: "أفضل لاعب لديهم",
      threat: "هدافهم الأخطر",
      creator: "يصنع معظم فرصهم",
      weak: "الحلقة الأضعف",
    },
    level: {
      "0": "متراجع",
      "1": "عادي",
      "2": "متقدم",
    },
    width: {
      "0": "ضيق",
      "1": "عادي",
      "2": "عريض",
    },
    change: {
      line: "خط الدفاع: {from} ← {to}",
      width: "العرض: {from} ← {to}",
      counter: "الهجمة المرتدة: {from} ← {to}",
    },
    on: "مفعّل",
    off: "متوقف",
  },
}

export default engine
