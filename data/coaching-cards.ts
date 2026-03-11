export interface CoachingProduct {
  name: string;
  definition: string;
  benefits: string[];
}

export interface CoachingCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  greeting: string;
  receptIntro: string;
  introQuestion: string;
  customerKnows: string[];
  customerDoesNotKnow: string[];
  bridgeToSupplement: string;
  products: CoachingProduct[];
  additionalBridges?: { text: string; products: CoachingProduct[] }[];
  tips?: string;
  agentKey?: string;
  videoPath?: string;
}

export const coachingCards: CoachingCard[] = [
  {
    id: "diuretikum",
    title: "Diuretikum",
    subtitle: "Entwässernde Medikamente",
    icon: "Droplets",
    color: "from-brand to-brand-accent",
    greeting: "Was kann ich für Sie tun?",
    receptIntro: "Vielen Dank, ich schaue gerade für Sie nach...",
    introQuestion: "Kennen Sie das Medikament bereits?",
    customerKnows: [
      "Gut, dann wissen Sie ja schon Bescheid, Frau/Herr XY.",
    ],
    customerDoesNotKnow: [
      "Diese Tabletten führen zu einer vermehrten Wasserausscheidung.",
      "Wasseransammlungen im Körper werden ausgeschwemmt, der Blutdruck wird gesenkt und das Herz entlastet.",
      "Nehmen Sie die Tabletten nach der Anweisung Ihres Arztes.",
    ],
    bridgeToSupplement:
      "Durch die entwässernde Wirkung werden auch Mineralstoffe ausgeschieden. Kommt es bei Ihnen jetzt häufiger vor, dass Sie Muskelkrämpfe haben?",
    products: [
      {
        name: "Magnesium Sandoz forte",
        definition: "Brausetabletten",
        benefits: [
          "Sie beugen einem Mangel vor und können ein bereits vorhandenes Defizit einfach ausgleichen.",
          "Sie spüren nicht nur die entspannende Wirkung in Ihrer Muskulatur sondern leisten zudem einen wichtigen Beitrag für die Energieversorgung Ihres Herzens.",
        ],
      },
    ],
    additionalBridges: [
      {
        text: "Durch die vermehrte Wasserausscheidung kann es auch zu Verdauungsproblemen kommen. Für den Fall empfehle ich Ihnen...",
        products: [
          {
            name: "Macrogol Hexal",
            definition: "Pulver zum Trinken nach Auflösen",
            benefits: [
              "Mit dem sanften aber zuverlässigen Wirkstoff haben Sie die Möglichkeit Ihre Verdauung jederzeit zu unterstützen.",
              "Zur Dauereinnahme geeignet.",
            ],
          },
        ],
      },
      {
        text: "Häufig zeigt sich eine trockenere Haut nach längerer Einnahme eines entwässernden Medikamentes.",
        products: [
          {
            name: "Eucerin Urea Lotion 3/10%",
            definition: "Lotion zum Auftragen auf die Körperhaut",
            benefits: [
              "Zur nachhaltigen Versorgung der Haut mit Feuchtigkeit.",
              "Wirksam gegen Juckreiz und hervorragend verträglich.",
              "Dadurch bewahren Sie sich eine glatte, gepflegte Haut.",
            ],
          },
        ],
      },
    ],
    tips: "Auf ausgewogene ballaststoffreiche Ernährung achten um das Gewicht und die Verdauung im Auge zu behalten.",
    agentKey: "pharmacy_diuretikum",
    videoPath: "videos/magnesium-intro.mp4",
  },
  {
    id: "fluoridbehandlung",
    title: "Fluoridbehandlung",
    subtitle: "Tabletten für Säuglinge/Kleinkinder",
    icon: "Baby",
    color: "from-brand to-brand-accent",
    greeting: "Was kann ich für Sie tun?",
    receptIntro: "Vielen Dank, ich schaue gerade für Sie nach.",
    introQuestion: "Hat Ihr Arzt Ihnen die Einnahme erklärt?",
    customerKnows: [
      "Gut, dann wissen Sie ja schon Bescheid, Frau/Herr XY.",
    ],
    customerDoesNotKnow: [
      "Es ist ein Vitamin- und Mineralstoffpräparat zur Vorbeugung von Rachitis und Karies bei Säuglingen/Kindern unter 2 Jahren.",
      "1 Tablette vor Mahlzeit ab Ende der 1. Lebenswoche.",
    ],
    bridgeToSupplement:
      "Bald werden Sie auch mit dem Thema 'Zahnen' zu tun haben. Dies kann ein recht unangenehmer und schmerzhafter Prozess für Ihr Kind sein. Es gibt zwei Möglichkeiten, wie Sie dieses Ihrem Kind und auch sich erleichtern können...",
    products: [
      {
        name: "Osanit",
        definition: "Globuli",
        benefits: [
          "Osanit Globuli sind eine homöopathische Zubereitung, die speziell auf Beschwerden der Zahnung abgestimmt sind: Schmerzen, Rötung des Zahnfleisches, Reizbarkeit und Unruhe.",
          "Wegen der angewandten Wirkstoffverdünnung sind sie gerade für Säuglinge gut geeignet. Außerdem sind die Globuli zuckerfrei.",
          "Man gibt halbstündlich, bei starken Schmerzen auch viertelstündlich, etwa 8 Kügelchen auf die Zunge.",
        ],
      },
    ],
    additionalBridges: [
      {
        text: "Mit den Zähnen kommt dann auch die Zeit, in der man auf die Zahnpflege achten muss. Ab dem Durchbruch des ersten Milchzahns sollte einmal täglich der/die Zahn/Zähne mit einer speziellen Kinderzahncreme vorsichtig geputzt werden.",
        products: [
          {
            name: "Nenedent Zahncreme ohne Fluor",
            definition: "Kinderzahncreme",
            benefits: [
              "Diese Zahncreme enthält keine Fluoride, da diese ja mit den Tabletten zugeführt werden.",
              "Ideal auch für Kinder, die die Zahncreme noch nicht ausspucken können.",
            ],
          },
        ],
      },
    ],
    tips: "Weiche Kinderzahnbürste verwenden. Eltern bei sich auf Zahnpflege achten (Karies über Speichel übertragbar). Zucker/Süßigkeiten vermeiden, ständiges Schnuller- und Flaschennuckeln vermeiden, ausreichend lange Pausen zwischen den Mahlzeiten einplanen, zahnärztliche Betreuung in Anspruch nehmen.",
    agentKey: "pharmacy_fluorid",
  },
  {
    id: "gastritis-reflux",
    title: "Gastritis / Reflux",
    subtitle: "Omeprazol / Pantoprazol",
    icon: "Flame",
    color: "from-brand to-brand-accent",
    greeting: "Guten Tag. Was kann ich für Sie tun?",
    receptIntro:
      "Vielen Dank. Ich stelle Ihnen die verordneten Medikamente zusammen.",
    introQuestion:
      "Nehmen Sie das Medikament/die Medikamente zum ersten Mal?",
    customerKnows: [
      "Dann wissen Sie ja schon Bescheid.",
      "Wie kommen Sie denn bisher damit zurecht?",
      "Welche Fragen sind inzwischen aufgetaucht?",
      "Seit wann nehmen Sie das AM bereits ein?",
      "Welche Ursache liegt Ihren Beschwerden evtl. zugrunde?",
      "Wann treten die Beschwerden auf?",
    ],
    customerDoesNotKnow: [
      "Was hat Ihnen Ihr Arzt zur Anwendung/Einnahme gesagt?",
      "Dosierung/Dauer der Einnahme klären.",
      "Wogegen wurde Ihnen dieses AM verordnet?",
      "Stress - Nahrungsgewohnheiten - Funktionsstörung des unteren Speiseröhrenschließmuskels?",
    ],
    bridgeToSupplement: "",
    products: [
      {
        name: "Iberogast",
        definition: "Tropfen zum Einnehmen",
        benefits: [
          "Diese pflanzlichen Tropfen haben sich sehr bewährt, wenn die Beschwerden mit Krämpfen, Völlegefühl nach dem Essen und ggf. Übelkeit verbunden sind.",
          "Mit der Einnahme vor den Mahlzeiten entspannen Sie den Magen und Sie können Ihre Mahlzeiten unbeschwerter genießen.",
        ],
      },
    ],
    additionalBridges: [
      {
        text: "Bei stressbedingten Magenbeschwerden empfehle ich Ihnen...",
        products: [
          {
            name: "Neurodoron Weleda",
            definition: "Tabletten zum Einnehmen",
            benefits: [
              "Dieses natürliche AM beruhigt Ihr Nervenkostüm ohne Sie zu ermüden.",
              "Sie sind insgesamt entspannter und stressbedingte Beschwerden lassen nach.",
            ],
          },
        ],
      },
    ],
    tips: "Kleinere Mahlzeiten, nicht scharf gewürzt, Alkohol und Nikotin, Süßes vermeiden, abends nicht zu spät essen. Teemischung aus Malve, Kamille und Süßholzwurzel zu gleichen Teilen trinken. Luvos Heilerde ultrafein sehr zu empfehlen und auch ein Kaltauszug aus Leinsamen (Schutz der Speiseröhre).",
    agentKey: "pharmacy_gastritis",
  },
  {
    id: "gicht",
    title: "Gicht",
    subtitle: "Harnsäuresenkende Medikamente",
    icon: "Bone",
    color: "from-brand to-brand-accent",
    greeting: "Was kann ich für Sie tun?",
    receptIntro: "Vielen Dank. Ich hole das Medikament für Sie.",
    introQuestion: "Nehmen Sie das Medikament zum ersten Mal?",
    customerKnows: [
      "Dann wissen Sie ja schon Bescheid.",
      "Wie kommen Sie denn mit dem AM zurecht?",
      "Welche Fragen sind evtl. aufgetaucht?",
    ],
    customerDoesNotKnow: [
      "Die Tabletten nehmen Sie in der Regel 1x täglich nach einer Mahlzeit ein.",
      "Diese halten Ihren Harnsäurewert niedrig.",
    ],
    bridgeToSupplement:
      "Wichtig ist es für Sie zu wissen, dass Sie durch vermehrte Flüssigkeitsaufnahme Ihren Harnsäurewert positiv beeinflussen können. Deswegen empfehle ich Ihnen...",
    products: [
      {
        name: "Vollmers Grüner Hafertee",
        definition: "Teebeutel zum Aufbrühen",
        benefits: [
          "3x tgl. getrunken führt er zu vermehrter Ausschwemmung der Harnsäure.",
          "Dadurch vermindern sich Ihre Gelenkbeschwerden und die Beweglichkeit wird verbessert.",
        ],
      },
    ],
    additionalBridges: [
      {
        text: "Bei erhöhten Harnsäurewerten ist es sinnvoll, auf einen ausgeglichenen Säure-Basen-Haushalt zu achten. Daher rate ich Ihnen zu der Einnahme von...",
        products: [
          {
            name: "Basica",
            definition: "Pulver zum Auflösen / Tabletten zum Einnehmen",
            benefits: [
              "Die basischen Mineralstoffe lockt die Harnsäure aus den Zellen, wo sie die Beschwerden verursachen.",
              "Sie lindern damit nicht nur die akuten Beschwerden, sondern beugen auch neuen Anfällen vor.",
              "Ich empfehle Ihnen mindestens eine dreimonatige Kur.",
            ],
          },
        ],
      },
    ],
    tips: "Verzicht auf Innereien, Geflügelhaut, Alkohol (Bier); Fleischverzehr einschränken; langsame Gewichtsreduktion (Crashdiäten können Gichtanfall auslösen); Patientenbroschüre.",
    agentKey: "pharmacy_gicht",
  },
  {
    id: "eisenmangel",
    title: "Eisenmangelanämie",
    subtitle: "Ferro Sanol / Hämatopan o.ä.",
    icon: "Heart",
    color: "from-brand to-brand-accent",
    greeting: "Was kann ich für Sie tun?",
    receptIntro: "Vielen Dank, ich schaue für Sie nach...",
    introQuestion: "Kennen Sie das Medikament bereits?",
    customerKnows: [
      "Gut, dann wissen Sie ja schon Bescheid, Frau/Herr XY.",
      "Wie geht es Ihnen denn seit der Einnahme?",
    ],
    customerDoesNotKnow: [
      "Bitte nehmen Sie Ihr Eisenpräparat regelmäßig morgens vor dem Frühstück ein.",
      "Trinken bitte in den ersten 2 Stunden keinen Tee oder Kaffee bzw. Milch, da hierdurch die Eisenaufnahme behindert würde.",
      "Welche Medikamente nehmen Sie morgens außerdem ein?",
      "Auf schwarzen Stuhlgang hinweisen.",
    ],
    bridgeToSupplement:
      "Für die Blutbildung ist neben Eisen auch eine ausreichende Zufuhr von Folsäure und Vitamin B12 wichtig, daher empfehle ich die kurweise Ergänzung mit...",
    products: [
      {
        name: "Vitasprint",
        definition: "Pulver mit Lösungsmittel zum Trinken",
        benefits: [
          "Diese konzentrierte Form der B12-Zufuhr sichert Ihnen eine schnelle Regeneration und unterstützt wesentlich die Reifung neuer Blutkörperchen.",
          "So werden Sie sich viel schneller wieder leistungsfähiger fühlen.",
        ],
      },
    ],
    additionalBridges: [
      {
        text: "Eine häufige Nebenwirkung von Eisenpräparaten ist leider der feste Stuhlgang. Hier können Sie mit einem Macrogol Pulver Abhilfe schaffen. Ich empfehle Ihnen...",
        products: [
          {
            name: "Macrogol Hexal Plus",
            definition: "Pulver zum Auflösen und Trinken",
            benefits: [
              "Einmal täglich eingenommen sorgt diese Lösung dafür, dass der Stuhl weich bleibt und erleichtert ihnen so den Stuhlgang.",
            ],
          },
        ],
      },
    ],
    tips: "Tierisches Eisen ist besser verwertbar als pflanzliches, Vitamin C erhöht die Eisenresorption (Vit. C Pulver anbieten). Schüßler Salze No 2+3 zur besseren Aufnahme des Eisens(3) und zur Unterstützung der Blutbildung(2).",
    agentKey: "pharmacy_eisenmangel",
  },
  {
    id: "grippeimpfstoff",
    title: "Grippeimpfstoff",
    subtitle: "Saisonale Impfung",
    icon: "Syringe",
    color: "from-brand to-brand-accent",
    greeting: "Was kann ich für Sie tun?",
    receptIntro:
      "Einen kleinen Augenblick, ich hole Ihnen das Medikament.",
    introQuestion: "Kennen Sie das Medikament?",
    customerKnows: ["Dann wissen Sie ja schon Bescheid."],
    customerDoesNotKnow: [
      "Mögliche Reaktionen auf den Impfstoff und Transport bzw. Lagerung besprechen - KÜHL!",
    ],
    bridgeToSupplement:
      "Um Ihr Immunsystem bei der Bildung von Antikörpern zu unterstützen, ist es sinnvoll gezielte Vitalstoffe zuzuführen...",
    products: [
      {
        name: "Orthomol immun / Orthomol immun junior (für Kinder ab 4 Jahre)",
        definition: "Trinkfläschchen / Granulat/Kombi / Tabl./Kaps. zum Einnehmen",
        benefits: [
          "Mit dieser extra Portion an Vitalstoffen stärken Sie Ihr Immunsystem nachhaltig und sichern sich so einen problemlosen Impferfolg.",
        ],
      },
    ],
    additionalBridges: [
      {
        text: "Übrigens wird in der Naturheilkunde die Einnahme von ... zur Vermeidung von Impfreaktionen empfohlen. Wie haben Sie denn die letzten Grippeimpfungen vertragen?",
        products: [
          {
            name: "Thuja D6",
            definition: "Globuli zum Einnehmen",
            benefits: [
              "Die Einnahme dieser kleinen Globuli erleichtert Ihrem Körper mit dem fremden Eiweiß des Impfstoffs klar zukommen.",
              "Das gilt natürlich auch für andere Impfstoffe, falls Sie sich noch gegen andere Erreger impfen lassen möchten.",
            ],
          },
        ],
      },
    ],
    tips: "Körperliche Aktivitäten am Impftag vermeiden, ausreichend Schlaf, ausgewogene Ernährung.",
    agentKey: "pharmacy_grippe",
  },
  {
    id: "helicobacter",
    title: "Helicobacter",
    subtitle: "Antibiotikum + PPI",
    icon: "Bug",
    color: "from-brand to-brand-accent",
    greeting: "Guten Tag, was kann ich für Sie tun?",
    receptIntro:
      "Danke für das Rezept, ich bearbeite es kurz. Sie bekommen von mir die Medikamente X/Y.",
    introQuestion:
      "Hat Ihnen Ihr Arzt erklärt wie diese einzunehmen sind?",
    customerKnows: [
      "Dann wissen Sie ja bestens Bescheid, Frau/Herr XY.",
    ],
    customerDoesNotKnow: ["Medikament und Einnahme besprechen."],
    bridgeToSupplement:
      "Ihre Medikamente sorgen dafür die Bakterien abzutöten und die vermehrte Säurebildung im Magen zu bremsen. Ich empfehle Ihnen diese Tropfen um die Beschwerden schnell und langfristig in den Griff zu bekommen...",
    products: [
      {
        name: "Iberogast Tropfen",
        definition: "Tropfen zum Einnehmen",
        benefits: [
          "Normalisiert die Bewegung des Magens und trägt zu einer besseren Aufspaltung der Nahrung bei.",
          "Magenschmerzen und Druck im Oberbauch werden nachhaltig gelindert.",
        ],
      },
    ],
    additionalBridges: [
      {
        text: "Zur Behandlung der Ursache und um zu vermeiden, dass Ihre Magenverstimmung wiederkommt oder andauert, ist es wichtig die Ursachen zu bekämpfen... (psychische Belastung ist)",
        products: [
          {
            name: "Baldrian ratio",
            definition: "Tabletten zum Einnehmen",
            benefits: [
              "Diese Kapseln werden Ihnen helfen mit Stresssituationen gelassener umzugehen und Ihnen ihre innere Erregung und Angst zu nehmen.",
            ],
          },
          {
            name: "Neurodoron",
            definition: "",
            benefits: [],
          },
        ],
      },
      {
        text: "Das Antibiotikum tötet neben den Krankheitserregern auch die guten Bakterien im Darm teilweise ab, daher ist es wichtig die Darmschleimhaut wiederaufzubauen, denn der gesamte Magen-Darm-Trakt ist wichtig für Ihr Wohlbefinden nach der Therapie. Hierzu empfehle ich Ihnen:",
        products: [
          {
            name: "Perenterol Kapseln",
            definition: "Kapseln zum Einnehmen",
            benefits: [
              "Baut die natürliche Darmflora wieder auf.",
              "Sorgt für eine gute Verdauung.",
              "Das Auftreten von Durchfall und Bauchschmerzen wird verhindert.",
            ],
          },
        ],
      },
    ],
    tips: "Fettarme Ernährung, Gebratenes meiden. Alkohol & Kaffee meiden, nicht Rauchen. In schlimmen Phasen empfiehlt es sich eine Diät mit leicht verdaulicher Kost zu halten (Zwieback, Haferschleim und Tee). Sie können jederzeit einen magenberuhigenden H&S Kamillentee trinken, Orthomol immun pro.",
    agentKey: "pharmacy_helicobacter",
  },
  {
    id: "hyperthyreose",
    title: "Hyperthyreose",
    subtitle: "Thiamazol / Carbimazol",
    icon: "Activity",
    color: "from-brand to-brand-accent",
    greeting: "Was kann ich für Sie tun?",
    receptIntro: "Vielen Dank, ich hole Ihnen das verordnete Arzneimittel.",
    introQuestion: "Kennen Sie das Medikament bereits?",
    customerKnows: [
      "Gut, dann wissen Sie ja schon Bescheid, Frau/Herr XY.",
    ],
    customerDoesNotKnow: [
      "Die medikamentöse Therapie lindert die Beschwerden der Schilddrüsenüberfunktion, indem die Überproduktion an Schilddrüsenhormonen gehemmt wird.",
      "Wichtig ist, dass Sie Ihren Tabletten regelmäßig 1x tgl. nehmen.",
    ],
    bridgeToSupplement:
      "Begleitend zu Ihrer verordneten Medikation können Sie aber auch schon selber etwas gegen die Symptome der Überfunktion tun. Viele Patienten leiden unter innerer Unruhe und Schlafstörungen. Wie geht es Ihnen?",
    products: [
      {
        name: "Baldrian ratiopharm",
        definition: "Dragees zum Einnehmen",
        benefits: [
          "Dieses pflanzliche Produkt beruhigt auch am Tage, ohne dass Sie müde werden und die Entspannung erleichtert Ihnen das Einschlafen am Abend.",
          "So dass Sie sich ausgeglichen und fit fühlen. Sie sind weniger gereizt und können sich besser konzentrieren.",
        ],
      },
    ],
    additionalBridges: [
      {
        text: "Bei Herzrasen/Herzklopfen können Sie add on zu dem/den vom Arzt verordneten Medikament/en homöopathische Kügelchen einnehmen, um das oft anfallsweise Herzrasen und das unangenehm spürbare Herzklopfen zu mildern.",
        products: [
          {
            name: "Leonorus cardiaca D6 (Das Herzgespann)",
            definition: "Homöopathische Kügelchen zum Einnehmen",
            benefits: [
              "Das Herzgespann mildert das oft anfallsweise Herzrasen und das unangenehm spürbare Herzklopfen.",
              "Dosierung: 3x tägl. 5 Globuli (nach Dr. med. Wiesenauer, PTA heute Nr. 1+2, Jan. 2014).",
            ],
          },
        ],
      },
    ],
    tips: "Auf ausgeglichenen Tagesablauf achten, Entspannungsübungen, trockene Haut (Eucerin Urea-Lotion).",
    agentKey: "pharmacy_hyperthyreose",
  },
  {
    id: "hypothyreose",
    title: "Hypothyreose",
    subtitle: "L-Thyroxin",
    icon: "Pill",
    color: "from-brand to-brand-accent",
    greeting: "Was kann ich für Sie tun?",
    receptIntro:
      "Vielen Dank, ich stelle Ihnen das Rezept eben zusammen...",
    introQuestion: "Kennen Sie das Medikament bereits?",
    customerKnows: [
      "Gut, dann wissen Sie ja schon Bescheid, Frau/Herr XY.",
      "Wie geht es Ihnen mit der Einnahme der Tabletten?",
    ],
    customerDoesNotKnow: [
      "Diese Tabletten ersetzen das fehlende Schilddrüsenhormon.",
      "Bis die für Sie individuell richtige Menge gefunden ist, kann es mehrere Wochen dauern, denn die Behandlung wird mit der niedrigsten Stärke begonnen.",
      "Sie nehmen die Tablette bitte regelmäßig morgens nüchtern ein.",
    ],
    bridgeToSupplement:
      "Viele Patienten leiden bei einer Unterfunktion der Schilddrüse unter trockener, schuppiger Haut und häufig auch unter Verdauungsproblemen. Wie geht es Ihnen persönlich?",
    products: [
      {
        name: "Eucerin Urea Lotio 3%/10%",
        definition: "Lotion zum Auftragen auf die Körperhaut",
        benefits: [
          "Diese Lotion zeichnet sich durch ihre nachhaltige Versorgung der Haut mit Feuchtigkeit aus.",
          "Dazu ist der natürliche Feuchtigkeitsbinder Urea enthalten.",
          "Das bedeutet für Sie, dass sie ein auf Ihre Bedürfnisse abgestimmtes Produkt erhalten und Trockenheit mit Juckreiz kein Thema mehr sind.",
        ],
      },
    ],
    additionalBridges: [
      {
        text: "Bis die Unterfunktion der Schilddrüse ausgeglichen ist, kann es immer wieder zu Verdauungsproblemen kommen. Für den Fall empfehle ich Ihnen...",
        products: [
          {
            name: "Macrogol Hexal plus",
            definition: "Pulver zum Trinken nach Auflösen",
            benefits: [
              "Mit dem sanften aber zuverlässigen Wirkstoff Macrogol haben Sie die Möglichkeit Ihre Verdauung jederzeit zu unterstützen.",
              "Es ist aufgrund seiner guten Verträglichkeit durchaus für eine Dauereinnahme geeignet.",
            ],
          },
        ],
      },
      {
        text: "Um brüchigen Nägeln und vermehrtem Haarausfall vorzubeugen empfehle ich Ihnen...",
        products: [
          {
            name: "Biotin ratiopharm 5mg",
            definition: "Tabletten zum Einnehmen",
            benefits: [
              "Diese Tabletten enthalten Vitamin H, das besonders wichtig ist um die Nägel zu stabilisieren und die Haare zu festigen.",
              "Damit sie immer gesund und in voller Fülle erhalten bleiben.",
            ],
          },
        ],
      },
    ],
    tips: "Auf ausgewogene ballaststoffreiche Ernährung achten, um das Gewicht und die Verdauung im Auge zu behalten.",
    agentKey: "pharmacy_hypothyreose",
  },
  {
    id: "kompressionsstruempfe",
    title: "Kompressionsstrümpfe",
    subtitle: "Anpassung & Pflege",
    icon: "Footprints",
    color: "from-brand to-brand-accent",
    greeting: "Guten Tag. Was darf ich für Sie tun?",
    receptIntro:
      "Danke schön. Für die Anpassung der Kompressionsstrümpfe machen wir einen Termin aus, kleinen Augenblick, ich hole das Terminbuch.",
    introQuestion: "",
    customerKnows: [
      "Sie kennen sich ja bereits mit der Handhabung von K.-Strümpfen aus.",
      "Wie kommen Sie denn damit bisher zurecht?",
    ],
    customerDoesNotKnow: [
      "Es ist wichtig, dass Ihre K.-Strümpfe in den Morgenstunden angemessen werden, wenn die Beine noch nicht angeschwollen sind.",
      "Bitte planen Sie 15-30 Minuten ein.",
      "Die Strümpfe werden am entkleideten Bein angepasst.",
    ],
    bridgeToSupplement:
      "Trotz der hochwertigen Materialien, die für Ihre K.-Strümpfe verwendet werden, kann die Haut durch das regelmäßige Tragen trocken und schuppig werden. Deshalb empfehle ich Ihnen, Ihre Beine vor dem Schlafen gehen mit... einzucremen.",
    products: [
      {
        name: "La Roche Posay Iso Urea",
        definition: "Creme zum Auftragen auf die Haut",
        benefits: [
          "Der enthaltene Harnstoff pflegt die Haut und versorgt Sie nachhaltig mit Feuchtigkeit.",
          "D.h. für Sie, dass Sie gepflegte Beine haben und Ihre Haut sich gut anfühlt.",
        ],
      },
    ],
    additionalBridges: [
      {
        text: "Das Anziehen der Strümpfe können Sie sich mit ... erleichtern.",
        products: [
          {
            name: "Belsana Handschuhe",
            definition: "Anziehhilfe",
            benefits: [
              "Diese Handschuhe sind aus Gummi, an den Fingern sind Noppen angebracht, dies verhindert ein Abrutschen beim Anziehen.",
              "Das bedeutet, ein leichteres Anziehen ohne große Anstrengungen und Sie schonen das Strumpfmaterial.",
            ],
          },
        ],
      },
    ],
    tips: "Zur schonenden Reinigung der Strümpfe ist besonders gut Belsana Blau40 Waschmittel geeignet. Strümpfe nicht mit Weichspüler waschen! Nicht in den Trockner geben, sondern auf einem Handtuch trocknen lassen.",
    agentKey: "pharmacy_kompression",
  },
];

export function getCoachingCardById(id: string): CoachingCard | undefined {
  return coachingCards.find((card) => card.id === id);
}
