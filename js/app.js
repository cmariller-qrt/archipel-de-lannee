
/* ============ STATUTS DE SOUS-CATÉGORIE ============ */
const STATUS_META = {
  not_started: {label:'Pas commencé', short:'Non démarré', pct:0, color:'var(--st-not)'},
  in_progress: {label:'En cours', short:'En cours', pctDefault:50, editable:true, color:'var(--st-progress)'},
  done: {label:'Terminé', short:'Terminé', pct:100, color:'var(--st-done)'},
  transferred: {label:'Transféré à une autre équipe', short:'Transféré', pct:95, color:'var(--st-transfer)'},
};
function leafPercent(item){
  if(item.status==='in_progress') return item.percent ?? STATUS_META.in_progress.pctDefault;
  return STATUS_META[item.status].pct;
}
// Une sous-catégorie avec des sous-sous-catégories n'a plus de statut propre :
// son % devient la moyenne de ses sous-sous-catégories (même logique que projet ↔ sous-catégories).
function subPercent(sub){
  if(sub.subsubs && sub.subsubs.length) return Math.round(sub.subsubs.reduce((a,ss)=>a+leafPercent(ss),0)/sub.subsubs.length);
  return leafPercent(sub);
}
function subIsDone(sub){
  if(sub.subsubs && sub.subsubs.length) return sub.subsubs.every(ss=>ss.status==='done');
  return sub.status==='done';
}
// Un projet sans sous-catégorie compte pour 0% dans les statistiques (mois/année),
// au lieu d'être ignoré silencieusement comme s'il n'existait pas.
function effectiveSubs(p){
  return p.subs.length ? p.subs : [{status:'not_started'}];
}

/* ============ DATA ============ */
const SEASONS = {
  winter: {label:'Hiver', color:'#6ec6e8', dim:'#1f3b52'},
  spring: {label:'Printemps', color:'#7fd68a', dim:'#22452a'},
  summer: {label:'Été', color:'#f2b23b', dim:'#5a3d13'},
  autumn: {label:'Automne', color:'#e08a52', dim:'#5a3018'},
};
const MONTHS = [
  {id:0, name:'Janvier', emoji:'❄️', season:'winter'},
  {id:1, name:'Février', emoji:'⛄', season:'winter'},
  {id:2, name:'Mars', emoji:'🌱', season:'spring'},
  {id:3, name:'Avril', emoji:'🌷', season:'spring'},
  {id:4, name:'Mai', emoji:'🌼', season:'spring'},
  {id:5, name:'Juin', emoji:'☀️', season:'summer'},
  {id:6, name:'Juillet', emoji:'🏖️', season:'summer'},
  {id:7, name:'Août', emoji:'🍉', season:'summer'},
  {id:8, name:'Septembre', emoji:'🍂', season:'autumn'},
  {id:9, name:'Octobre', emoji:'🎃', season:'autumn'},
  {id:10, name:'Novembre', emoji:'🍁', season:'autumn'},
  {id:11, name:'Décembre', emoji:'🎄', season:'winter'},
];
const ISLAND_IMAGES = [
  'assets/islands/00_Janvier.png',
  'assets/islands/01_Fevrier.png',
  'assets/islands/02_Mars.png',
  'assets/islands/03_Avril.png',
  'assets/islands/04_Mai.png',
  'assets/islands/05_Juin.png',
  'assets/islands/06_Juillet.png',
  'assets/islands/07_Aout.png',
  'assets/islands/08_Septembre.png',
  'assets/islands/09_Octobre.png',
  'assets/islands/10_Novembre.png',
  'assets/islands/11_Decembre.png'
];

const HUB_IMAGE = 'assets/hub-depart.png';

const ISLAND_LORE = [
  {
    title: `L'Île de Cristal Éternel`,
    p1: `Imaginez un monde où le temps s'est figé sous une caresse de glace pure, une île sculptée dans un bloc de cristal translucide, éternellement piégée dans la blancheur immaculée du solstice d'hiver. C'est l'Île de Cristal Éternel, un royaume de gel et de silence où l'air est si pur qu'il semble pétiller à chaque inspiration. Des structures géométriques de glace s'élèvent vers un ciel où les aurores boréales dansent en rubans de lumière émeraude et saphir, jetant des reflets irisés sur les surfaces polies. Les arbres, des sapins gigantesques, sont pétrifiés dans un gel scintillant, leurs branches supportant le poids d'un million de diamants glacés. Un torrent de cristal, gelé en cascade, semble figé dans un mouvement éternel, ses eaux emprisonnées sous une couche de glace si transparente qu'on peut y voir les secrets du fond de la rivière. Un pont de glace naturelle, aussi délicat qu'une toile d'araignée gelée, enjambe le torrent, menant vers une grotte secrète où le cœur de l'île bat encore, protégé par une magie ancienne.`,
    p2: `Animaux : Les Renards-Frimas sont les gardiens de ce désert glacé. Leur fourrure est aussi blanche que la neige fraîche, et chaque poil est incrusté d'un minuscule cristal de glace qui reflète la lumière des aurores boréales. Ils se déplacent avec une grâce éthérée, leurs pas silencieux sur la glace polie.

Êtres Fantastiques : Les Gardiens Cristallins sont des entités sylvaines composées entièrement de glace vivante. Ils sont nés de la source sacrée de l'île, et leur corps scintille d'une lumière intérieure qui palpite au rythme du cœur de l'île. Ils protègent la source et veillent sur l'équilibre de l'île, utilisant leur magie pour modeler la glace et créer des structures d'une beauté à couper le souffle.`,
    p3: `L'Île de Cristal Éternel n'a pas toujours été une prison de glace. Autrefois, c'était une île verdoyante, couverte de forêts luxuriantes et baignée par des eaux chaudes. Mais un jour, un sorcier maléfique, jaloux de la beauté de l'île, décida de la plonger dans un hiver éternel. Il utilisa une magie puissante pour geler la source sacrée de l'île, source de vie, et piéger ses habitants dans un gel éternel. La Reine des Glaces, éprise de l'île, décida de la protéger en scellant la source dans un bloc de cristal indestructible. Depuis lors, l'île attend que le secret de la source soit découvert, et que la Reine des Glaces revienne pour libérer l'île de sa prise glacée et restaurer sa beauté originelle.`,
  },
  {
    title: `L'Île Amoureuse Suspendue`,
    p1: `Flottant dans les nuages comme un rêve éveillé, l'Île Amoureuse Suspendue est un sanctuaire romantique et délicat, un lieu où l'amour règne en maître. C'est une île de rêve, une création de l'imagination, où les nuages sont aussi doux que la soie et les étoiles aussi brillantes que des diamants. Des cascades de roses de toutes les teintes se déversent dans des bassins en forme de cœur, remplis d'une eau parfumée qui palpite au rythme des battements du cœur de l'île. Des ponts de vigne ornes de fleurs délicates relient les différentes parties de l'île, et des kiosques en fer forgé invitent à la flânerie et à la contemplation. L'air est parfumé de roses et de lilas, et une douce lumière rosée baigne l'île, apaisant le cœur et l'esprit. Les arbres, des cerisiers en fleurs, sont couverts de pétales roses qui tombent doucement sur le sol, créant un tapis de fleurs qui semble s'étendre à l'infini.`,
    p2: `Animaux : Les Colibris-Cœurs sont les messagers de l'amour sur cette île de rêve. Leurs plumes forment des motifs de cœur sur leurs ailes, et leur chant est aussi doux qu'une berceuse. Ils volent de fleur en fleur, transportant les secrets de l'amour et veillant sur l'harmonie de l'île.

Êtres Fantastiques : Les Fées des Fleurs sont de douces entités ailées qui tissent les cascades de roses et s'assurent que l'amour règne sur l'île. Elles sont nées des fleurs de l'île, et leur corps scintille d'une lumière intérieure qui palpite au rythme de l'amour. Elles utilisent leur magie pour créer des compositions florales d'une beauté à couper le souffle et pour inspirer l'amour dans le cœur des visiteurs.`,
    p3: `L'Île Amoureuse Suspendue fut créée par un amoureux transi pour sa bien-aimée, une fée qui ne pouvait vivre que parmi les fleurs. Il consacra sa vie à sculpter l'île et à y planter les roses les plus rares, créant un lieu d'amour éternel. Il utilisa une magie puissante pour suspendre l'île dans les nuages, la protégeant des dangers du monde terrestre. Après leur départ, les fées des fleurs continuèrent à entretenir l'île, gardant vivante la mémoire de cet amour légendaire et s'assurant que l'île reste un sanctuaire de l'amour éternel.`,
  },
  {
    title: `L'Atoll de la Renaissance Printanière`,
    p1: `S’éveillant avec vigueur après un long sommeil, l’Atoll de la Renaissance Printanière est une île luxuriante qui bouillonne de vie. C'est un monde de couleurs vibrantes et de senteurs enivrantes, un paradis printanier où la nature explose de vie. Des fleurs géantes, aux pétales aussi doux que le velours, s’épanouissent aux couleurs de l'arc-en-ciel, et les arbres bourgeonnent, leurs branches couvertes de jeunes feuilles d'un vert tendre. Des ruisseaux cristallins, nés de la source sacrée de l'île, se frayent un chemin à travers des prairies d'un vert émeraude, créant une musique douce qui se mêle au chant des oiseaux. L'air est parfumé de pollen et de terre fraîche, et résonne du bourdonnement des abeilles et du bruissement des feuilles. Les collines, douces et onduleuses, sont couvertes de fleurs sauvages, créant un tapis de couleurs qui semble s'étendre à l'infini.`,
    p2: `Animaux : Les Lapins-Boutons sont les gardiens de ce paradis printanier. Leurs oreilles ressemblent à des bourgeons de fleurs, et leur fourrure est aussi douce que le velours. Ils gambadent dans les prairies, jouant parmi les fleurs et veillant sur l'équilibre de l'île.

Êtres Fantastiques : Les Esprits du Printemps sont des entités énergétiques qui catalysent la renaissance de la nature et veillent à l'équilibre de la vie sur l'île. Ils sont nés de la source sacrée de l'île, et leur corps scintille d'une lumière intérieure qui palpite au rythme du printemps. Ils utilisent leur magie pour épanouir les fleurs, bourgeonner les arbres et créer un climat de vie éternelle sur l'île.`,
    p3: `L'Atoll de la Renaissance Printanière fut autrefois une île stérile, dévastée par une terrible sécheresse. Mais un Esprit du Printemps, ému par la désolation de l'île, offrit une graine magique qui catalysa la renaissance de la nature. Il utilisa sa magie pour irriguer l'île et pour planter les graines de la vie, créant un paradis printanier qui témoigne de la puissance de la vie. Depuis lors, l'île s'éveille chaque printemps avec une force et une beauté renouvelées, témoignant de la puissance de la vie et de la magie de la renaissance.`,
  },
  {
    title: `L'Archipel des Farces Flottantes`,
    p1: `Composé d'une myriade d'îlots mouvants et de plateformes colorées, l'Archipel des Farces Flottantes est un dédale fantaisiste où l'imprévu est roi. C'est un monde de surprises et de rires, un parc d'attractions permanent où l'ennui n'a pas sa place. Des ponts arc-en-ciel relient les îles, et des pièges ludiques et des surprises attendent les aventuriers à chaque tournant. L'air est rempli d'éclats de rire et de confettis, et l'île semble s'amuser de la confusion des visiteurs. Les arbres, aux formes étranges et aux couleurs vives, sont couverts de ballons et de rubans, créant une ambiance de fête perpétuelle. Les maisons, construites avec des matériaux hétéroclites, semblent flotter dans les airs, défidant les lois de la gravité.`,
    p2: `Animaux : Les Singes-Farceurs sont les maîtres de ce dédale fantaisiste. Ils sont agiles et espiègles, et ils adorent jouer des tours aux visiteurs, cachant leurs objets et créant de fausses pistes. Ils sont nés de la joie de l'île, et leur corps scintille d'une lumière intérieure qui palpite au rythme du rire.

Êtres Fantastiques : Les Lutin des Farces sont de petites créatures espiègles qui conçoivent les pièges et s'assurent que l'ennui n'a pas sa place sur l'île. Ils sont nés de l'imagination de l'île, et leur corps scintille d'une lumière intérieure qui palpite au rythme de l'invention. Ils utilisent leur magie pour créer des pièges ludiques et des surprises d'une créativité à couper le souffle.`,
    p3: `L'Archipel des Farces Flottantes fut créé par un roi facétieux pour amuser sa cour et s'assurer que son royaume ne soit jamais ennuyeux. Il consacra sa vie à concevoir des farces et des surprises, transformant l'île en un parc d'attractions permanent. Il utilisa une magie puissante pour faire flotter l'île dans les airs, la protégeant des dangers du monde terrestre. Après son départ, les lutins des farces continuèrent à entretenir l'île, gardant vivante la mémoire de ce roi joyeux et s'assurant que l'île reste un sanctuaire de la joie éternelle.`,
  },
  {
    title: `L'Île des Fleurs Célestes`,
    p1: `Dominée par des plantes géantes et exotiques, l'Île des Fleurs Célestes est un jardin suspendu spectaculaire. C'est un monde de beauté et de grâce, un paradis floral où l'harmonie règne en maître. Des terrasses de fleurs aux couleurs vives forment des motifs complexes, et de grands papillons aux ailes scintillantes butinent parmi les fleurs. L'air est saturé de parfums enivrants, et l'île semble toucher le ciel, baignée par la douce lumière du soleil. Les arbres, aux troncs tortueux et aux branches couvertes de fleurs délicates, forment un dôme protecteur qui protège l'île des vents forts. Les rivières, nées de la source sacrée de l'île, se frayent un chemin à travers des jardins suspendus, créant une musique douce qui se mêle au chant des oiseaux.`,
    p2: `Animaux : Les Papillons-Monarques Célestes sont les messagers de la beauté sur cette île de rêve. Leurs ailes géantes reflètent la couleur du ciel, et leur vol est aussi gracieux qu'une danse. Ils veillent sur la beauté du jardin et s'assurent que l'harmonie règne sur l'île.

Êtres Fantastiques : Les Gardiens du Jardin sont des entités majestueuses qui veillent sur la beauté du jardin et s'assurent que l'harmonie règne sur l'île. Ils sont nés de la source sacrée de l'île, et leur corps scintille d'une lumière intérieure qui palpite au rythme de la beauté. Ils utilisent leur magie pour cultiver les plantes, harmoniser les couleurs et créer un paradis floral d'une beauté à couper le souffle.`,
    p3: `L'Île des Fleurs Célestes fut créée par un botaniste passionné qui rêvait de créer un jardin qui toucherait le ciel. Il consacra sa vie à cultiver les plantes les plus rares et les plus exotiques, transformant l'île en un paradis floral. Il utilisa une magie puissante pour suspendre l'île dans les airs, la protégeant des dangers du monde terrestre. Après son départ, les gardiens du jardin continuèrent à entretenir l'île, gardant vivante la mémoire de ce botaniste visionnaire et s'assurant que l'île reste un sanctuaire de la beauté éternelle.`,
  },
  {
    title: `L'Île du Soleil de Minuit`,
    p1: `Baignée par la douce lumière du soleil qui ne se couche jamais, l'Île du Soleil de Minuit est un paradis estival où le temps semble s'être arrêté. C'est un monde de chaleur et de lumière, un sanctuaire solaire où l'énergie de l'été est éternelle. Des plages de sable doré s'étendent à perte de vue, bordées par des lagons turquoise et des palmiers aux feuilles bruissantes. L'air est chaud et résonne du chant des vagues, et l'île semble endormie dans un rêve d'été éternel. Les collines, couvertes de végétation luxuriante, sont parsemées de villages pittoresques où les habitants vivent en harmonie avec la nature. Les rivières, nées de la source sacrée de l'île, se frayent un chemin à travers des champs de tournesols, créant une musique douce qui se mêle au chant des cigales.`,
    p2: `Animaux : Les Tortues-Soleil sont les gardiennes de ce paradis solaire. Leurs carapaces géantes reflètent la couleur du soleil, et leur déplacement est aussi lent et calme que la course du soleil. Elles veillent sur l'équilibre de l'île et s'assurent que l'énergie solaire est bien répartie.

Êtres Fantastiques : Les Esprits de l'Été sont des entités chaleureuses qui catalysent l'énergie de l'été et veillent à l'équilibre de la vie sur l'île. Ils sont nés de la source sacrée de l'île, et leur corps scintille d'une lumière intérieure qui palpite au rythme de l'été. Ils utilisent leur magie pour maintenir la chaleur, intensifier la lumière et créer un paradis estival d'une beauté à couper le souffle.`,
    p3: `L'Île du Soleil de Minuit fut créée par un roi qui rêvait d'un été éternel pour son peuple. Il consacra sa vie à sculpter l'île et à y attirer l'énergie du soleil, transformant l'île en un paradis d'été éternel. Il utilisa une magie puissante pour sceller le soleil dans le ciel de l'île, s'assurant qu'il ne se couche jamais. Après son départ, les esprits de l'été continuèrent à entretenir l'île, gardant vivante la mémoire de ce roi solaire et s'assurant que l'île reste un sanctuaire de l'été éternel.`,
  },
  {
    title: `L'Île de la Fête Étincelante`,
    p1: `Adornée de drapeaux colorés, de lumières scintillantes et de feux d'artifice permanents, l'Île de la Fête Étincelante est un lieu de célébration permanent. C'est un monde de joie et de rires, un sanctuaire festif où la fête n'a pas de fin. Une scène de musique centrale accueille des musiciens de tout le royaume, et des attractions foraines colorées invitent à la fête. L'air est rempli de musique et de rires, et l'île semble s'amuser de la joie des visiteurs. Les arbres, aux formes étranges et aux couleurs vives, sont couverts de ballons et de rubans, créant une ambiance de fête perpétuelle. Les maisons, construites avec des matériaux hétéroclites, semblent danser dans les airs, défidant les lois de la gravité.`,
    p2: `Animaux : Les Oiseaux-Tambours sont les messagers de la joie sur cette île festive. Leurs chants ressemblent au rythme d'un tambour, et leur vol est aussi énergique qu'une danse. Ils veillent sur l'ambiance festive de l'île et s'assurent que l'ennui n'a pas sa place.

Êtres Fantastiques : Les Esprits de la Fête sont des entités énergétiques qui catalysent l'énergie de la fête et s'assurent que l'ennui n'a pas sa place sur l'île. Ils sont nés de la source sacrée de l'île, et leur corps scintille d'une lumière intérieure qui palpite au rythme de la fête. Ils utilisent leur magie pour intensifier la joie, illuminer l'île et créer un paradis festif d'une beauté à couper le souffle.`,
    p3: `L'Île de la Fête Étincelante fut créée par un roi fêtard pour s'assurer que son peuple ne soit jamais triste. Il consacra sa vie à organiser des fêtes et des célébrations, transformant l'île en un lieu de fête permanent. Il utilisa une magie puissante pour illuminer l'île de lumières scintillantes, s'assurant qu'elle ne soit jamais sombre. Après son départ, les esprits de la fête continuèrent à entretenir l'île, gardant vivante la mémoire de ce roi joyeux et s'assurant que l'île reste un sanctuaire de la joie éternelle.`,
  },
  {
    title: `L'Atoll du Volcan Endormi`,
    p1: `Dominée par un majestueux volcan endormi, l'Atoll du Volcan Endormi est une île volcanique spectaculaire. C'est un monde de feu et de roche, un sanctuaire tellurique où l'énergie du volcan est éternelle. Des coulées de lave pétrifiées forment des paysages dramatiques, et des sources chaudes apaisantes invitent à la relaxation. L'air est chaud et résonne du murmure du volcan, et l'île semble endormie dans un rêve de feu éternel. Les collines, couvertes de végétation éparse, sont parsemées de grottes où les habitants vivent en harmonie avec le volcan. Les rivières, nées de la source sacrée de l'île, se frayent un chemin à travers des champs de lave, créant une musique sourde qui se mêle au grondement du volcan.`,
    p2: `Animaux : Les Lézards-Lave sont les gardiens de ce paradis volcanique. Leurs peaux reflètent la couleur de la lave, et leur déplacement est aussi rapide et fluide que la lave. Ils veillent sur l'équilibre du volcan et s'assurent que l'énergie tellurique est bien répartie.

Êtres Fantastiques : Les Gardiens du Volcan sont des entités de feu qui veillent sur le volcan et s'assurent que le feu ne s'éteigne jamais sur l'île. Ils sont nés de la source sacrée de l'île, et leur corps scintille d'une lumière intérieure qui palpite au rythme du volcan. Ils utilisent leur magie pour maintenir le feu, contrôler la lave et créer un paradis volcanique d'une beauté à couper le souffle.`,
    p3: `L'Atoll du Volcan Endormi fut créée par un roi qui rêvait d'un feu éternel pour son peuple. Il consacra sa vie à sculpter l'île et à y attirer l'énergie du feu, transformant l'île en un paradis de feu éternel. Il utilisa une magie puissante pour sceller le feu dans le cœur de l'île, s'assurant qu'il ne s'éteigne jamais. Après son départ, les gardiens du volcan continuèrent à entretenir l'île, gardant vivante la mémoire de ce roi de feu et s'assurant que l'île reste un sanctuaire du feu éternel.`,
  },
  {
    title: `L'Île des Moissons Dorées`,
    p1: `Couverte de champs de blé onduleux et de vergers regorgeant de fruits, l'Île des Moissons Dorées est un paysage automnal chaleureux. C'est un monde d'abondance et de récolte, un sanctuaire agraire où l'énergie de l'automne est éternelle. Des moulins à vent tournoyants moudront le grain, et des paniers de fruits colorés invitent à la récolte. L'air est parfumé de fruits mûrs et de terre fraîche, et l'île résonne du chant des moissonneurs. Les collines, douces et onduleuses, sont couvertes de champs de blé, créant un tapis d'or qui semble s'étendre à l'infini. Les maisons, construites avec des matériaux ruraux, sont entourées de vergers où les habitants vivent en harmonie avec la nature.`,
    p2: `Animaux : Les Marmottes-Récoltes sont les gardiennes de ce paradis agraire. Elles adorent récolter les fruits et les céréales, et leur fourrure est aussi douce que le blé. Elles veillent sur l'équilibre des champs et s'assurent que les récoltes sont abondantes.

Êtres Fantastiques : Les Esprits des Moissons sont des entités chaleureuses qui catalysent l'énergie des moissons et veillent à l'équilibre de la vie sur l'île. Ils sont nés de la source sacrée de l'île, et leur corps scintille d'une lumière intérieure qui palpite au rythme des moissons. Ils utilisent leur magie pour faire mûrir les fruits, moudre le grain et créer un paradis agraire d'une beauté à couper le souffle.`,
    p3: `L'Île des Moissons Dorées fut créée par un roi qui rêvait d'une moisson éternelle pour son peuple. Il consacra sa vie à cultiver les champs et les vergers, transformant l'île en un paradis de moisson éternelle. Il utilisa une magie puissante pour sceller la récolte dans le cœur de l'île, s'assurant qu'elle ne s'épuise jamais. After son départ, les esprits des moissons continuèrent à entretenir l'île, gardant vivante la mémoire de ce roi de moisson et s'assurant que l'île reste un sanctuaire de l'abondance éternelle.`,
  },
  {
    title: `L'Île des Esprits Malicieux`,
    p1: `Dominée par une tour sombre et effrayante, l'Île des Esprits Malicieux est un lieu de mystère et d'effroi. C'est un monde d'ombres et de sortilèges, un sanctuaire ésotérique où l'énergie de la peur est éternelle. Des arbres tordus et des lanternes en forme de citrouille décorent l'île, et des apparitions spectrales invitent à la peur. L'air est rempli de murmures et d'éclats de rire, et l'île semble s'amuser de la peur des visiteurs. Les collines, couvertes de végétation sombre, sont parsemées de grottes où les habitants vivent en harmonie avec les esprits. Les rivières, nées de la source sacrée de l'île, se frayent un chemin à travers des marécages brumeux, créant une musique lugubre qui se mêle au murmure des esprits.`,
    p2: `Animaux : Les Chauves-Souris-Farceuses sont les messagères de la peur sur cette île ésotérique. Elles adorent jouer des tours aux visiteurs, volant autour d'eux et créant de fausses alertes. Elles veillent sur l'ambiance ésotérique de l'île et s'assurent que la peur n'a pas de fin.

Êtres Fantastiques : Les Esprits Malicieux sont des entités de l'ombre qui catalysent l'énergie de la peur et s'assurent que l'ennui n'a pas sa place sur l'île. Ils sont nés de la source sacrée de l'île, et leur corps scintille d'une lumière intérieure qui palpite au rythme de la peur. Ils utilisent leur magie pour créer des apparitions spectrales, des bruits lugubres et un paradis ésotérique d'une beauté à couper le souffle.`,
    p3: `L'Île des Esprits Malicieux fut créée par un roi qui rêvait d'une peur éternelle pour son peuple. Il consacra sa vie à organiser des tours et des surprises, transformant l'île en un lieu de peur permanent. Il utilisa une magie puissante pour sceller les esprits dans la tour sombre de l'île, s'assurant qu'ils ne s'échappent jamais. Après son départ, les esprits malicieux continuèrent à entretenir l'île, gardant vivante la mémoire de ce roi de peur et s'assurant que l'île reste un sanctuaire de la peur éternelle.`,
  },
  {
    title: `L'Atoll du Vent et de la Brume`,
    p1: `Dominée par un phare solitaire, l'Atoll du Vent et de la Brume est une île mélancolique et venteuse. C'est un monde de sel et de vent, un sanctuaire marin où l'énergie de la tempête est éternelle. Des falaises abruptes se jettent dans une mer agitée, et des brumes persistantes décorent l'île. L'air est rempli de sel et de vent, et l'île résonne du murmure de la mer. Les collines, couvertes de végétation éparse, sont parsemées de grottes où les habitants vivent en harmonie avec le vent. Les rivières, nées de la source sacrée de l'île, se frayent un chemin à travers des champs de bruyère, créant une musique sourde qui se mêle au grondement de la mer.`,
    p2: `Animaux : Les Phoques-Brumes sont les gardiens de ce paradis marin. Ils adorent nager dans la brume, se cachant des prédateurs et jouant parmi les vagues. Ils veillent sur l'équilibre de la mer et s'assurent que l'énergie marine est bien répartie.

Êtres Fantastiques : Les Esprits du Vent sont des entités chaleureuses qui catalysent l'énergie du vent et veillent à l'équilibre de la vie sur l'île. Ils sont nés de la source sacrée de l'île, et leur corps scintille d'une lumière intérieure qui palpite au rythme du vent. Ils utilisent leur magie pour maintenir le vent, intensifier la brume et créer un paradis marin d'une beauté à couper le souffle.`,
    p3: `L'Atoll du Vent et de la Brume fut créée par un roi qui rêvait d'un vent éternel pour son peuple. He consacra sa vie à sculpter l'île et à y attirer l'énergie du vent, transformant l'île en un paradis de vent éternel. Il utilisa une magie puissante pour sceller le vent dans le cœur de l'île, s'assurant qu'il ne s'éteigne jamais. Après son départ, les esprits du vent continuèrent à entretenir l'île, gardant vivante la mémoire de ce roi du vent et s'assurant que l'île reste un sanctuaire du vent éternel.`,
  },
  {
    title: `L'Île du Père Noël des Glaces`,
    p1: `Nichée dans une vallée enneigée et scintillante, l'Île du Père Noël des Glaces est un lieu de joie et de partage. C'est un monde de neige et de cadeaux, un sanctuaire hivernal où l'énergie de Noël est éternelle. Un atelier de jouets bustling résonne des marteaux et des rires des lutins, et un immense sapin de Noël scintillant décore l'île. L'air est parfumé de biscuits et de cannelle, et l'île résonne du chant des lutins. Les collines, couvertes de neige fraîche, sont parsemées de chalets pittoresques où les habitants vivent en harmonie avec Noël. Les rivières, nées de la source sacrée de l'île, se frayent un chemin à travers des champs de neige, créant une musique douce qui se mêle au chant des lutins.`,
    p2: `Animaux : Les Rennes-Noël sont les messagers de Noël sur cette île hivernale. Ils adorent voler dans le ciel, transportant les cadeaux et jouant parmi les étoiles. Ils veillent sur l'ambiance festive de l'île et s'assurent que la joie n'a pas de fin.

Êtres Fantastiques : Les Lutins de Noël sont des entités de la joie qui catalysent l'énergie de Noël et s'assurent que la joie règne sur l'île. Ils sont nés de la source sacrée de l'île, et leur corps scintille d'une lumière intérieure qui palpite au rythme de Noël. Ils utilisent leur magie pour fabriquer des jouets, illuminer l'île et créer un paradis hivernal d'une beauté à couper le souffle.`,
    p3: `L'Île du Père Noël des Glaces fut créée par un roi qui rêvait d'un Noël éternel pour son peuple. Il consacra sa vie à organiser des fêtes et des partages, transformant l'île en un lieu de Noël permanent. Il utilisa une magie puissante pour sceller Noël dans le cœur de l'île, s'assurant qu'il ne s'éteigne jamais. Après son départ, les lutins de Noël continuèrent à entretenir l'île, gardant vivante la mémoire de ce roi joyeux et s'assurant que l'île reste un sanctuaire de la joie éternelle.`,
  },
];

const ANIMAL_IMAGES = [
  { name: `Renard des Frimas`, src: 'assets/animals/00_renards_frimas.png' },
  { name: `Colibris-Cœurs`, src: 'assets/animals/01_colibris_coeurs.png' },
  { name: `Lapins-Boutons`, src: 'assets/animals/02_lapins_boutons.png' },
  { name: `Singes Farceurs`, src: 'assets/animals/03_singes_farceurs.png' },
  { name: `Papillons Monarques Célestes`, src: 'assets/animals/04_papillons_monarques.png' },
  { name: `Tortue-Soleil`, src: 'assets/animals/05_tortues_soleil.png' },
  { name: `Oiseaux-Tambours`, src: 'assets/animals/06_oiseaux_tambours.png' },
  { name: `Lézards de Lave`, src: 'assets/animals/07_lezards_lave.png' },
  { name: `Marmottes des Récoltes`, src: 'assets/animals/08_marmottes_recoltes.png' },
  { name: `Chauves-souris Farceuses`, src: 'assets/animals/09_chauves_souris_farceuses.png' },
  { name: `Phoques des Brumes`, src: 'assets/animals/10_phoques_brumes.png' },
  { name: `Rennes de Noël`, src: 'assets/animals/11_rennes_noel.png' }
];

const CURRENT_MONTH = new Date().getMonth(); // 0=janvier … 11=décembre

let PROJECTS = [
  {id:'p1', month:0, name:'Refonte site vitrine', color:'#f0c15c', subs:[
    {id:'s1', name:'Cahier des charges', date:'08 janv.', status:'done'},
    {id:'s2', name:'Maquettes validées', date:'22 janv.', status:'done'},
  ]},
  {id:'p2', month:1, name:'Lancement newsletter', color:'#6ec6e8', subs:[
    {id:'s3', name:'Choix outil emailing', date:'05 févr.', status:'done'},
    {id:'s4', name:'Premier envoi', date:'26 févr.', status:'done'},
  ]},
  {id:'p3', month:2, name:'Salon professionnel', color:'#7fd68a', subs:[
    {id:'s5', name:'Réservation stand', date:'10 mars', status:'done'},
    {id:'s6', name:'Supports imprimés', date:'24 mars', status:'transferred'},
  ]},
  {id:'p4', month:4, name:'Certification équipe', color:'#7fd68a', subs:[
    {id:'s7', name:'Inscription formation', date:'03 mai', status:'done'},
    {id:'s8', name:'Examen final', date:'28 mai', status:'done'},
  ]},
  {id:'p5', month:6, name:'Migration outil interne', color:'#f2b23b', subs:[
    {id:'s9', name:"Audit de l'existant", date:'02 juil.', status:'done'},
    {id:'s10', name:'Migration des données', date:'15 juil.', status:'done'},
    {id:'s11', name:'Formation utilisateurs', date:'29 juil.', status:'done'},
  ]},
  {id:'p6', month:7, name:'Campagne de rentrée', color:'#f2b23b', subs:[
    {id:'s12', name:'Brief créa', date:'05 août', status:'done'},
    {id:'s13', name:'Validation visuels', date:'18 août', status:'in_progress', percent:60},
    {id:'s14', name:'Mise en ligne', date:'29 août', status:'not_started'},
  ]},
  {id:'p7', month:7, name:'Recrutement alternant', color:'#f0c15c', subs:[
    {id:'s15', name:'Diffusion offre', date:'10 août', status:'transferred'},
    {id:'s16', name:'Entretiens', date:'26 août', status:'in_progress', percent:30},
  ]},
  {id:'p8', month:8, name:'Rentrée & séminaire', color:'#e08a52', subs:[
    {id:'s17', name:'Réservation lieu', date:'04 sept.', status:'not_started'},
    {id:'s18', name:'Programme validé', date:'20 sept.', status:'not_started'},
  ]},
  {id:'p9', month:10, name:'Bilan annuel', color:'#e08a52', subs:[
    {id:'s19', name:'Collecte des chiffres', date:'08 nov.', status:'not_started'},
    {id:'s20', name:'Présentation direction', date:'25 nov.', status:'not_started'},
  ]},
  {id:'p10', month:11, name:'Préparation N+1', color:'#6ec6e8', subs:[
    {id:'s21', name:'Roadmap objectifs', date:'05 déc.', status:'not_started'},
    {id:'s22', name:'Budget prévisionnel', date:'18 déc.', status:'not_started'},
  ]},
];

// La collection d'animaux : chaque compagnon se débloque selon une étape de progression
// différente (pas uniquement "ce mois précis terminé à 100%"), pour avancer en parallèle
// de la découverte des îles et des projets tout au long de l'année.
function isMonthFullyDone(monthId){
  const subs = projectsForMonth(monthId).flatMap(effectiveSubs);
  return subs.length>0 && subs.every(subIsDone);
}
const ANIMAL_BADGES = [
  {animalIndex:2,  desc:"Termine ta première sous-catégorie",   test:s=>s.subsDone>=1},
  {animalIndex:3,  desc:"Termine un projet complet",             test:s=>s.projectsDone>=1},
  {animalIndex:0,  desc:"Découvre ta première île",              test:s=>s.islandsDiscovered>=1},
  {animalIndex:1,  desc:"5 sous-catégories terminées",           test:s=>s.subsDone>=5},
  {animalIndex:5,  desc:"Niveau 7 d'exploration atteint",        test:s=>s.level>=7},
  {animalIndex:6,  desc:"12 sous-catégories terminées",          test:s=>s.subsDone>=12},
  {animalIndex:8,  desc:"3 projets terminés",                    test:s=>s.projectsDone>=3},
  {animalIndex:10, desc:"6 projets terminés",                    test:s=>s.projectsDone>=6},
  {animalIndex:4,  desc:"12 projets terminés",                   test:s=>s.projectsDone>=12},
  {animalIndex:7,  desc:"Niveau 5 d'exploration atteint",        test:s=>s.level>=5},
  {animalIndex:9,  desc:"6 îles découvertes",                    test:s=>s.islandsDiscovered>=6},
  {animalIndex:11, desc:"Année complétée à 100%",                test:s=>s.yearPct>=100},
];

/* ============ HELPERS ============ */
function projectsForMonth(m){ return PROJECTS.filter(p=>p.month===m && !p.archived); }
function monthStats(m){
  const projs = projectsForMonth(m);
  const subs = projs.flatMap(effectiveSubs);
  const pct = subs.length ? Math.round(subs.reduce((a,s)=>a+subPercent(s),0)/subs.length) : 0;
  const doneCount = subs.filter(subIsDone).length;
  return {total:subs.length, doneCount, pct};
}
function globalStats(){
  const activeProjects = PROJECTS.filter(p=>!p.archived);
  const allSubs = activeProjects.flatMap(effectiveSubs);
  const subsDone = allSubs.filter(subIsDone).length;
  const projectsDone = activeProjects.filter(p=>p.subs.length>0 && p.subs.every(subIsDone)).length;
  const monthsDone = MONTHS.filter(m=>isMonthFullyDone(m.id)).length;
  const yearPct = allSubs.length ? Math.round(allSubs.reduce((a,s)=>a+subPercent(s),0)/allSubs.length) : 0;
  // Formule volontairement plus lente : progresser sur l'année entière doit être nécessaire
  // pour atteindre les niveaux élevés, pas seulement quelques mois bien avancés.
  const xp = Math.round(allSubs.reduce((sum,s)=>sum+subPercent(s)/100*12,0)) + projectsDone*25 + monthsDone*40;
  const level = levelFromXp(xp);
  const xpToNext = xpForNextLevel(level);
  // "Découverte" (pour les badges) = île entièrement révélée (100%, plus aucun nuage),
  // pas seulement un peu de progression (voir isMonthUnlocked, plus permissif, qui gère
  // le brouillard progressif et le clic sur la carte).
  const islandsDiscovered = MONTHS.filter(m=>isMonthFullyDone(m.id)).length;
  return {subsDone, projectsDone, monthsDone, yearPct, xp, level, xpToNext, islandsDiscovered, currentMonth:CURRENT_MONTH, noLateThisMonth:true};
}
const LEVEL_NAMES = ['Explorateur','Aventurier','Stratège','Bâtisseur','Vétéran','Maître du temps',"Sage de l'Archipel",'Légende'];
const LEVEL_THRESHOLDS = [0, 120, 280, 460, 680, 950, 1300, 1700]; // XP cumulé requis pour atteindre chaque niveau
function levelFromXp(xp){
  let lvl = 1;
  for(let i=1;i<LEVEL_THRESHOLDS.length;i++){
    if(xp >= LEVEL_THRESHOLDS[i]) lvl = i+1;
  }
  return lvl;
}
function xpForNextLevel(lvl){
  // renvoie {current, next, isMax} : seuil du niveau courant et du suivant, ou null si niveau max
  const idx = lvl-1;
  const current = LEVEL_THRESHOLDS[Math.min(idx, LEVEL_THRESHOLDS.length-1)];
  const next = idx+1 < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[idx+1] : null;
  return { current, next, isMax: next===null };
}
function levelName(lvl){ return LEVEL_NAMES[Math.min(lvl-1, LEVEL_NAMES.length-1)]; }
function pctColor(pct){
  if(pct>=100) return 'var(--st-done)';
  if(pct>=95) return 'var(--st-transfer)';
  if(pct>0) return 'var(--st-progress)';
  return 'var(--st-not)';
}

/* ============ RADIAL LAYOUT ============ */
const RADIUS_OFFSET = [0,3,-2,4,0,-3,2,0,3,-2,4,-3];
const BASE_RADIUS = 42;
function islandPos(i){
  const angle = (-90 + i*30) * Math.PI/180;
  const r = BASE_RADIUS + RADIUS_OFFSET[i];
  return { x: 50 + r*Math.cos(angle), y: 50 + r*Math.sin(angle) };
}

/* ============ ÎLES ILLUSTRÉES (SVG procédural) ============ */
function hexToHsl(hex){
  hex = hex.replace('#','');
  const r=parseInt(hex.substr(0,2),16)/255, g=parseInt(hex.substr(2,2),16)/255, b=parseInt(hex.substr(4,2),16)/255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h,s,l=(max+min)/2;
  if(max===min){ h=0; s=0; }
  else{
    const d=max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    if(max===r) h=(g-b)/d+(g<b?6:0);
    else if(max===g) h=(b-r)/d+2;
    else h=(r-g)/d+4;
    h/=6;
  }
  return {h:h*360, s:s*100, l:l*100};
}
function hslToHex(h,s,l){
  h=((h%360)+360)%360; s=Math.max(0,Math.min(100,s))/100; l=Math.max(0,Math.min(100,l))/100;
  const c=(1-Math.abs(2*l-1))*s, x=c*(1-Math.abs((h/60)%2-1)), m=l-c/2;
  let r,g,b;
  if(h<60){r=c;g=x;b=0;} else if(h<120){r=x;g=c;b=0;} else if(h<180){r=0;g=c;b=x;}
  else if(h<240){r=0;g=x;b=c;} else if(h<300){r=x;g=0;b=c;} else {r=c;g=0;b=x;}
  const toHex=v=>Math.round((v+m)*255).toString(16).padStart(2,'0');
  return '#'+toHex(r)+toHex(g)+toHex(b);
}
const SEASON_MONTHS = {winter:[11,0,1], spring:[2,3,4], summer:[5,6,7], autumn:[8,9,10]};
function seasonColorForMonth(monthId, seasonKey){
  const base = SEASONS[seasonKey];
  const idx = SEASON_MONTHS[seasonKey].indexOf(monthId);
  const shift = idx - 1; // -1, 0, 1 : chaque mois d'une saison a une nuance légèrement différente
  const bc = hexToHsl(base.color), bd = hexToHsl(base.dim);
  return {
    color: hslToHex(bc.h + shift*9, bc.s, Math.max(20, Math.min(85, bc.l + shift*5))),
    dim: hslToHex(bd.h + shift*9, bd.s, Math.max(10, Math.min(70, bd.l + shift*5))),
  };
}
function seededRandom(seed){
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ t>>>15, t | 1);
  t ^= t + Math.imul(t ^ t>>>7, t | 61);
  return ((t ^ t>>>14) >>> 0) / 4294967296;
}
function blobPath(seed, cx, cy, baseR, points, irregularity, squash){
  const pts = [];
  for(let i=0;i<points;i++){
    const angle = (i/points)*Math.PI*2;
    const r = baseR * (1 - irregularity/2 + seededRandom(seed + i*13.37)*irregularity);
    pts.push({x: cx + r*Math.cos(angle), y: cy + r*Math.sin(angle)*squash});
  }
  const mid = (a,b)=>({x:(a.x+b.x)/2, y:(a.y+b.y)/2});
  const first = mid(pts[pts.length-1], pts[0]);
  let d = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)} `;
  for(let i=0;i<pts.length;i++){
    const next = pts[(i+1)%pts.length];
    const m = mid(pts[i], next);
    d += `Q ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${m.x.toFixed(1)} ${m.y.toFixed(1)} `;
  }
  return d + 'Z';
}
const MONTH_DECOR = [
  // 0 Janvier — sommet enneigé + fanion
  (cx,cy,dim)=>`
    <polygon points="${cx-11},${cy+4} ${cx-1},${cy-14} ${cx+9},${cy+4}" fill="${dim}" opacity="0.9"/>
    <polygon points="${cx-5},${cy-7} ${cx-1},${cy-14} ${cx+3},${cy-7}" fill="#ffffff" opacity="0.95"/>
    <line x1="${cx+10}" y1="${cy+4}" x2="${cx+10}" y2="${cy-16}" stroke="${dim}" stroke-width="1.2"/>
    <polygon points="${cx+10},${cy-16} ${cx+10},${cy-11} ${cx+16},${cy-13.5}" fill="#f0c15c"/>
  `,
  // 1 Février — bonhomme de neige
  (cx,cy,dim)=>`
    <circle cx="${cx}" cy="${cy+2}" r="7" fill="#ffffff"/>
    <circle cx="${cx}" cy="${cy-8}" r="5.2" fill="#ffffff"/>
    <circle cx="${cx}" cy="${cy-16}" r="3.8" fill="#ffffff"/>
    <circle cx="${cx-1.3}" cy="${cy-17}" r="0.7" fill="#1c2a3a"/>
    <circle cx="${cx+1.3}" cy="${cy-17}" r="0.7" fill="#1c2a3a"/>
    <polygon points="${cx},${cy-16} ${cx+3},${cy-15} ${cx},${cy-14.3}" fill="#e08a52"/>
    <rect x="${cx-4}" y="${cy-22}" width="8" height="2.4" fill="${dim}"/>
    <rect x="${cx-2.6}" y="${cy-24.5}" width="5.2" height="3" fill="${dim}"/>
    <line x1="${cx-6}" y1="${cy-8}" x2="${cx-11}" y2="${cy-11}" stroke="#8a6a4a" stroke-width="1"/>
    <line x1="${cx+6}" y1="${cy-8}" x2="${cx+11}" y2="${cy-11}" stroke="#8a6a4a" stroke-width="1"/>
  `,
  // 2 Mars — pousse en germination
  (cx,cy,dim)=>`
    <path d="M${cx-6},${cy+4} L${cx-4},${cy-4} L${cx+4},${cy-4} L${cx+6},${cy+4} Z" fill="${dim}" opacity="0.8"/>
    <line x1="${cx}" y1="${cy-4}" x2="${cx}" y2="${cy-14}" stroke="#3d7a3d" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M${cx},${cy-11} Q${cx-7},${cy-13} ${cx-6},${cy-19}" fill="none" stroke="#4a9450" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M${cx},${cy-9} Q${cx+7},${cy-11} ${cx+6},${cy-17}" fill="none" stroke="#4a9450" stroke-width="1.4" stroke-linecap="round"/>
  `,
  // 3 Avril — moulin à vent + tulipes
  (cx,cy,dim)=>`
    <rect x="${cx-2.5}" y="${cy-14}" width="5" height="18" fill="${dim}"/>
    <circle cx="${cx}" cy="${cy-14}" r="1.6" fill="#3a2a08"/>
    <path d="M${cx},${cy-14} L${cx-9},${cy-19} L${cx-6},${cy-11} Z" fill="#eef3fb" opacity="0.9"/>
    <path d="M${cx},${cy-14} L${cx+9},${cy-9} L${cx+3},${cy-8} Z" fill="#eef3fb" opacity="0.9"/>
    <path d="M${cx},${cy-14} L${cx+6},${cy-22} L${cx+2},${cy-16} Z" fill="#eef3fb" opacity="0.75"/>
    <path d="M${cx},${cy-14} L${cx-4},${cy-6} L${cx-1},${cy-10} Z" fill="#eef3fb" opacity="0.75"/>
    <ellipse cx="${cx-9}" cy="${cy+2}" rx="2" ry="3" fill="#e0698f"/>
    <ellipse cx="${cx+8}" cy="${cy+3}" rx="2" ry="3" fill="#f2b23b"/>
  `,
  // 4 Mai — mât fleuri
  (cx,cy,dim)=>`
    <line x1="${cx}" y1="${cy+4}" x2="${cx}" y2="${cy-20}" stroke="${dim}" stroke-width="1.4"/>
    <path d="M${cx},${cy-19} Q${cx-10},${cy-8} ${cx-8},${cy+3}" fill="none" stroke="#e0698f" stroke-width="1.6"/>
    <path d="M${cx},${cy-19} Q${cx+10},${cy-8} ${cx+8},${cy+3}" fill="none" stroke="#f2b23b" stroke-width="1.6"/>
    <path d="M${cx},${cy-19} Q${cx-2},${cy-6} ${cx-1},${cy+4}" fill="none" stroke="#7fd68a" stroke-width="1.6"/>
    <circle cx="${cx}" cy="${cy-20}" r="2" fill="#f0c15c"/>
  `,
  // 5 Juin — phare
  (cx,cy,dim)=>`
    <polygon points="${cx-4},${cy+4} ${cx-2.5},${cy-16} ${cx+2.5},${cy-16} ${cx+4},${cy+4}" fill="#eef3fb"/>
    <rect x="${cx-4}" y="${cy-6}" width="8" height="2.4" fill="${dim}"/>
    <rect x="${cx-3.3}" y="${cy-1}" width="6.6" height="2.2" fill="${dim}"/>
    <rect x="${cx-3}" y="${cy-19}" width="6" height="3.4" fill="${dim}"/>
    <polygon points="${cx-3.4},${cy-19} ${cx},${cy-23} ${cx+3.4},${cy-19}" fill="#e08a52"/>
    <path d="M${cx+3},${cy-17} L${cx+12},${cy-20}" stroke="#fff6c9" stroke-width="1.4" opacity="0.85"/>
  `,
  // 6 Juillet — parasol de plage
  (cx,cy,dim)=>`
    <line x1="${cx}" y1="${cy+4}" x2="${cx}" y2="${cy-13}" stroke="${dim}" stroke-width="1.3"/>
    <path d="M${cx-12},${cy-13} Q${cx},${cy-24} ${cx+12},${cy-13} Q${cx+6},${cy-16} ${cx},${cy-13} Q${cx-6},${cy-16} ${cx-12},${cy-13} Z" fill="#e08a52"/>
    <rect x="${cx+6}" y="${cy}" width="9" height="5" fill="#eef3fb" opacity="0.9"/>
    <rect x="${cx+6}" y="${cy}" width="9" height="1.6" fill="#e0698f"/>
  `,
  // 7 Août — pastèque
  (cx,cy,dim)=>`
    <path d="M${cx-9},${cy} A9,9 0 0 1 ${cx+9},${cy} Z" fill="#e0698f"/>
    <path d="M${cx-9},${cy} A9,9 0 0 1 ${cx+9},${cy}" fill="none" stroke="#4a9450" stroke-width="2"/>
    <circle cx="${cx-3}" cy="${cy-4}" r="0.7" fill="#1c2a3a"/>
    <circle cx="${cx+2}" cy="${cy-3}" r="0.7" fill="#1c2a3a"/>
    <circle cx="${cx}" cy="${cy-6}" r="0.7" fill="#1c2a3a"/>
  `,
  // 8 Septembre — pomme et livres (rentrée)
  (cx,cy,dim)=>`
    <rect x="${cx-8}" y="${cy}" width="16" height="3" fill="#e08a52"/>
    <rect x="${cx-7}" y="${cy-3}" width="14" height="3" fill="#6ec6e8"/>
    <rect x="${cx-6}" y="${cy-6}" width="12" height="3" fill="#f0c15c"/>
    <circle cx="${cx}" cy="${cy-12}" r="4.5" fill="#e0546f"/>
    <path d="M${cx},${cy-16} Q${cx+3},${cy-19} ${cx+5},${cy-17}" fill="none" stroke="#4a9450" stroke-width="1.4"/>
  `,
  // 9 Octobre — citrouille
  (cx,cy,dim)=>`
    <ellipse cx="${cx}" cy="${cy}" rx="9" ry="7" fill="#e08a52"/>
    <line x1="${cx-4.5}" y1="${cy-6.5}" x2="${cx-4.5}" y2="${cy+6.5}" stroke="#c96a35" stroke-width="0.8"/>
    <line x1="${cx}" y1="${cy-7}" x2="${cx}" y2="${cy+7}" stroke="#c96a35" stroke-width="0.8"/>
    <line x1="${cx+4.5}" y1="${cy-6.5}" x2="${cx+4.5}" y2="${cy+6.5}" stroke="#c96a35" stroke-width="0.8"/>
    <path d="M${cx-1},${cy-7} Q${cx},${cy-11} ${cx+1.5},${cy-9}" stroke="#4a9450" stroke-width="1.6" fill="none"/>
    <polygon points="${cx-3},${cy-2} ${cx-1},${cy-4} ${cx+1},${cy-2}" fill="#3a2a08"/>
    <polygon points="${cx+1},${cy-2} ${cx+3},${cy-4} ${cx+5},${cy-2}" fill="#3a2a08"/>
    <path d="M${cx-4},${cy+2} Q${cx},${cy+5} ${cx+4},${cy+2}" stroke="#3a2a08" stroke-width="1.2" fill="none"/>
  `,
  // 10 Novembre — feu de camp et feuilles
  (cx,cy,dim)=>`
    <line x1="${cx-5}" y1="${cy+3}" x2="${cx+4}" y2="${cy-3}" stroke="#8a6a4a" stroke-width="1.6"/>
    <line x1="${cx+5}" y1="${cy+3}" x2="${cx-4}" y2="${cy-3}" stroke="#8a6a4a" stroke-width="1.6"/>
    <path d="M${cx},${cy-2} Q${cx-3},${cy-8} ${cx},${cy-14} Q${cx+4},${cy-8} ${cx},${cy-2} Z" fill="#f2b23b"/>
    <path d="M${cx},${cy-4} Q${cx-1.5},${cy-8} ${cx},${cy-11} Q${cx+2},${cy-8} ${cx},${cy-4} Z" fill="#e0546f"/>
    <ellipse cx="${cx-10}" cy="${cy-18}" rx="2.6" ry="1.6" fill="#e08a52" transform="rotate(20 ${cx-10} ${cy-18})"/>
    <ellipse cx="${cx+8}" cy="${cy-22}" rx="2.4" ry="1.4" fill="#c96a35" transform="rotate(-15 ${cx+8} ${cy-22})"/>
  `,
  // 11 Décembre — sapin décoré + cadeau
  (cx,cy,dim)=>`
    <polygon points="${cx-9},${cy+2} ${cx},${cy-8} ${cx+9},${cy+2}" fill="${dim}"/>
    <polygon points="${cx-7},${cy-4} ${cx},${cy-12} ${cx+7},${cy-4}" fill="${dim}"/>
    <polygon points="${cx-5},${cy-10} ${cx},${cy-17} ${cx+5},${cy-10}" fill="${dim}"/>
    <polygon points="${cx-1.6},${cy-20} ${cx},${cy-23} ${cx+1.6},${cy-20} ${cx},${cy-17.5}" fill="#f0c15c"/>
    <circle cx="${cx-4}" cy="${cy-2}" r="1" fill="#e0546f"/>
    <circle cx="${cx+3}" cy="${cy-6}" r="1" fill="#6ec6e8"/>
    <circle cx="${cx-2}" cy="${cy-9}" r="1" fill="#f0c15c"/>
    <rect x="${cx+7}" y="${cy}" width="6" height="5" fill="#e0546f"/>
    <rect x="${cx+7}" y="${cy+2}" width="6" height="1.4" fill="#f0c15c"/>
  `,
];

/* Petits éléments secondaires (près du rivage), un par mois, différents du décor principal */
const MONTH_PROP = [
  // 0 Janvier — petits rochers gelés
  (x,y,dim)=>`<ellipse cx="${x}" cy="${y}" rx="4" ry="2.4" fill="${dim}" opacity="0.8"/><ellipse cx="${x+5}" cy="${y+1.5}" rx="2.6" ry="1.6" fill="${dim}" opacity="0.6"/>`,
  // 1 Février — petit sapin enneigé
  (x,y,dim)=>`<polygon points="${x-3.5},${y+2} ${x},${y-7} ${x+3.5},${y+2}" fill="${dim}"/><polygon points="${x-1.6},${y-2.5} ${x},${y-7} ${x+1.6},${y-2.5}" fill="#ffffff" opacity="0.9"/>`,
  // 2 Mars — petit tas de galets
  (x,y,dim)=>`<circle cx="${x}" cy="${y}" r="2.4" fill="${dim}"/><circle cx="${x+3.4}" cy="${y+1}" r="1.8" fill="${dim}" opacity="0.75"/><circle cx="${x-2.6}" cy="${y+1.2}" r="1.5" fill="${dim}" opacity="0.6"/>`,
  // 3 Avril — arrosoir
  (x,y,dim)=>`<ellipse cx="${x}" cy="${y}" rx="3.6" ry="2.4" fill="${dim}"/><path d="M${x+3},${y-1} L${x+8},${y-3.5}" stroke="${dim}" stroke-width="1.4"/><path d="M${x-3},${y-2} Q${x-1},${y-4} ${x+1},${y-2}" fill="none" stroke="${dim}" stroke-width="1.2"/>`,
  // 4 Mai — papillon
  (x,y,dim)=>`<ellipse cx="${x-1.8}" cy="${y-1}" rx="2.2" ry="1.6" fill="#e0698f" transform="rotate(-25 ${x-1.8} ${y-1})"/><ellipse cx="${x+1.8}" cy="${y-1}" rx="2.2" ry="1.6" fill="#f2b23b" transform="rotate(25 ${x+1.8} ${y-1})"/><line x1="${x}" y1="${y-2.4}" x2="${x}" y2="${y+0.6}" stroke="${dim}" stroke-width="1"/>`,
  // 5 Juin — cordage enroulé
  (x,y,dim)=>`<circle cx="${x}" cy="${y}" r="4" fill="none" stroke="${dim}" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="2.2" fill="none" stroke="${dim}" stroke-width="1.2"/>`,
  // 6 Juillet — ballon de plage
  (x,y,dim)=>`<circle cx="${x}" cy="${y}" r="4.2" fill="#eef3fb"/><path d="M${x-4},${y} A4.2,4.2 0 0 1 ${x},${y-4.2}" fill="#e0698f"/><path d="M${x},${y+4.2} A4.2,4.2 0 0 1 ${x+4},${y}" fill="#6ec6e8"/>`,
  // 7 Août — lunettes de soleil sur le sable
  (x,y,dim)=>`<circle cx="${x-2.6}" cy="${y}" r="2.2" fill="#1c2a3a"/><circle cx="${x+2.6}" cy="${y}" r="2.2" fill="#1c2a3a"/><line x1="${x-0.6}" y1="${y}" x2="${x+0.6}" y2="${y}" stroke="#1c2a3a" stroke-width="1"/>`,
  // 8 Septembre — petit cartable
  (x,y,dim)=>`<rect x="${x-3.4}" y="${y-3}" width="6.8" height="6" rx="1.2" fill="${dim}"/><rect x="${x-1.6}" y="${y-4.6}" width="3.2" height="2" fill="${dim}" opacity="0.8"/>`,
  // 9 Octobre — petite chauve-souris
  (x,y,dim)=>`<path d="M${x},${y} Q${x-5},${y-4} ${x-6},${y+1} Q${x-2},${y-1} ${x},${y+1} Q${x+2},${y-1} ${x+6},${y+1} Q${x+5},${y-4} ${x},${y} Z" fill="#3a2a44"/>`,
  // 10 Novembre — tas de feuilles
  (x,y,dim)=>`<ellipse cx="${x}" cy="${y}" rx="6" ry="3" fill="#c96a35" opacity="0.85"/><ellipse cx="${x-2}" cy="${y-1}" rx="2" ry="1.2" fill="#e08a52"/><ellipse cx="${x+2.4}" cy="${y-0.8}" rx="1.8" ry="1.1" fill="#f2b23b"/>`,
  // 11 Décembre — sucre d'orge
  (x,y,dim)=>`<path d="M${x},${y+4} L${x},${y-2} Q${x},${y-5} ${x+3},${y-5}" fill="none" stroke="#e0546f" stroke-width="2" stroke-linecap="round"/><path d="M${x},${y+4} L${x},${y-2} Q${x},${y-5} ${x+3},${y-5}" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="1.6,1.6" stroke-linecap="round"/>`,
];
function islandSVG(monthId, seasonKey, invite){
  const season = seasonColorForMonth(monthId, seasonKey);
  const cx=50, cy=50;
  const seed = monthId*97 + 11;
  const shoreD = blobPath(seed+500, cx, cy+6, 40, 9, 0.3, 0.78);
  const bodyD = blobPath(seed, cx, cy, 35, 9, 0.34, 0.78);
  const gradId = 'islGrad'+monthId, shineId = 'islShine'+monthId;
  const decorFn = MONTH_DECOR[monthId];
  const decor = decorFn ? decorFn(cx, cy-10, season.dim) : '';
  const propFn = MONTH_PROP[monthId];
  const propAngle = seededRandom(seed+300)*Math.PI*2;
  const propR = 20+seededRandom(seed+310)*6;
  const propX = cx + Math.cos(propAngle)*propR, propY = cy+4 + Math.sin(propAngle)*propR*0.6;
  const prop = propFn ? propFn(propX, propY, season.dim) : '';

  // texture : mélange de touffes d'herbe et petits galets, dispersés
  let ticks = '';
  for(let i=0;i<7;i++){
    const a = seededRandom(seed+900+i)*Math.PI*2;
    const rr = 14+seededRandom(seed+950+i)*20;
    const tx = cx+Math.cos(a)*rr, ty = cy+5+Math.sin(a)*rr*0.68;
    if(i%3===0){
      ticks += `<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="${(0.8+seededRandom(seed+i)*0.7).toFixed(1)}" fill="${season.dim}" opacity="0.4"/>`;
    } else {
      ticks += `<path d="M${(tx-1.8).toFixed(1)},${(ty+1).toFixed(1)} Q${tx.toFixed(1)},${(ty-2.6).toFixed(1)} ${(tx+1.8).toFixed(1)},${(ty+1).toFixed(1)}" stroke="${season.dim}" stroke-width="0.9" fill="none" opacity="0.45" stroke-linecap="round"/>`;
    }
  }

  // vaguelettes autour du rivage
  let waves = '';
  for(let i=0;i<3;i++){
    const wy = cy + 24 + i*4.5;
    waves += `<path d="M${cx-30+i*4},${wy} Q${cx-15},${wy-3} ${cx},${wy} Q${cx+15},${wy+3} ${cx+30-i*4},${wy}" stroke="#eef3fb" stroke-width="0.7" fill="none" opacity="${0.22-i*0.05}"/>`;
  }

  const sparkle = invite ? `
    <g class="island-sparkle">
      <path d="M${cx+24},${cy-30} l1.6,4 4,1.6 -4,1.6 -1.6,4 -1.6,-4 -4,-1.6 4,-1.6 Z" fill="#fff6c9"/>
    </g>
  ` : '';

  return `
    <svg class="island-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${season.color}"/>
          <stop offset="100%" stop-color="${season.dim}"/>
        </linearGradient>
        <radialGradient id="${shineId}" cx="35%" cy="22%" r="60%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.32"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      ${waves}
      <path d="${shoreD}" fill="${season.dim}" opacity="0.55"/>
      <path d="${bodyD}" fill="url(#${gradId})" stroke="${season.dim}" stroke-width="0.8"/>
      <path d="${bodyD}" fill="url(#${shineId})"/>
      ${ticks}
      ${prop}
      ${decor}
      ${sparkle}
    </svg>
  `;
}

function isMonthUnlocked(monthId){
  // "Découverte" = de la vraie progression a été faite (pct>0), qu'il s'agisse d'un mois
  // passé, courant ou futur. Un projet qui existe mais reste à 0% ne compte pas : sinon
  // l'île resterait visuellement toujours couverte de nuages (0% = brouillard complet)
  // tout en étant comptée comme "découverte" pour les badges — incohérent.
  const st = monthStats(monthId);
  return st.total>0 && st.pct>0;
}

function cloudPuffsHtml(pct, locked){
  const puffCount = 4;
  const visiblePuffs = locked ? puffCount : Math.max(0, puffCount - Math.floor(pct/25));
  const puffGeo = [
    {l:5, t:10, w:55, h:45}, {l:40, t:0, w:60, h:50},
    {l:20, t:35, w:60, h:45}, {l:-5, t:35, w:55, h:45},
  ];
  let html = '';
  for(let p=0;p<puffCount;p++){
    const g = puffGeo[p];
    const isGone = p < (puffCount - visiblePuffs);
    html += `<div class="puff ${isGone?'gone':''}" style="left:${g.l}%; top:${g.t}%; width:${g.w}%; height:${g.h}%;"></div>`;
  }
  return html;
}

function buildMap(){
  const container = document.getElementById('radial-container');
  container.innerHTML = '';
  const s = globalStats();

  const svgns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgns,'svg');
  svg.setAttribute('class','branches');
  svg.setAttribute('viewBox','0 0 100 100');
  svg.setAttribute('preserveAspectRatio','none');
  MONTHS.forEach((m)=>{
    const pos = islandPos(m.id);
    const locked = !isMonthUnlocked(m.id);
    const seasonColor = SEASONS[m.season].color;
    const mx = 50 + (pos.x-50)*0.5, my = 50 + (pos.y-50)*0.5;
    const path = document.createElementNS(svgns,'path');
    path.setAttribute('d', `M50,50 Q${mx},${my} ${pos.x},${pos.y}`);
    path.setAttribute('fill','none');
    path.setAttribute('stroke', locked ? 'rgba(255,255,255,0.12)' : seasonColor);
    path.setAttribute('stroke-width', '0.6');
    path.setAttribute('stroke-linecap','round');
    path.setAttribute('opacity', locked ? '0.4' : '0.85');
    path.setAttribute('stroke-dasharray', locked ? '1.2,1.6' : 'none');
    svg.appendChild(path);
  });
  container.appendChild(svg);

  const hub = document.createElement('div');
  hub.className='hub';
  hub.title = "Voir toute la to-do de l'année";
  hub.innerHTML = `
    <img class="hub-img" src="${HUB_IMAGE}" alt="Départ">
    <div class="hub-info" id="hub-info-badge" title="Voir le détail des niveaux">
      <div class="hub-score mono">${s.yearPct}%</div>
      <div class="hub-score-label">de l'année</div>
      <div class="hub-level title-font">Niv. ${s.level} · ${levelName(s.level)}</div>
      <div class="hub-xp">${s.xp} XP total</div>
      <div class="hub-hint">👆 voir toute la to-do</div>
    </div>
  `;
  hub.querySelector('#hub-info-badge').addEventListener('click', (e)=>{
    e.stopPropagation();
    openLevelDetail();
  });
  hub.addEventListener('click', ()=>{ showToast('🧭','Ouverture de ta to-do complète…'); openFullTodoTab(); });
  container.appendChild(hub);

  MONTHS.forEach((m)=>{
    const pos = islandPos(m.id);
    const st = monthStats(m.id);
    const locked = !isMonthUnlocked(m.id);
    const done = st.total>0 && st.doneCount===st.total;
    const node = document.createElement('div');
    node.className = 'island-node' + (locked?' locked':'') + (done?' done':'') + (m.id===CURRENT_MONTH?' appear':'');
    node.style.left = pos.x+'%';
    node.style.top = pos.y+'%';
    const sizePct = Math.min(27, 21 + Math.min(st.total,8)*0.8);
    node.style.width = sizePct+'%';

    const puffsHtml = cloudPuffsHtml(st.pct, locked);

    node.innerHTML = `
      <div class="island-visual" style="animation-delay:-${(m.id*0.42).toFixed(2)}s">
        <img class="island-svg" src="${ISLAND_IMAGES[m.id]}" alt="${m.name}">
        ${(!locked && !done) ? '<div class="island-sparkle-badge">✨</div>' : ''}
        <div class="island-check">✓</div>
        <div class="cloud-layer">${puffsHtml}</div>
      </div>
      <div class="island-sub">${locked ? '—' : st.pct+'%'}</div>
    `;
    if(!locked){
      node.addEventListener('click', ()=>{
        playIslandZoom(m.id, m.season, node.querySelector('.island-visual'), m.name, ()=>openMonth(m.id));
      });
    } else {
      node.addEventListener('click', ()=>showToast('🌫️', 'Cette île est encore dans le brouillard'));
    }
    container.appendChild(node);
  });

}

/* ============ MONTH DETAIL (clic sur une île) ============ */
/* ============ EFFET DE ZOOM VERS L'ÎLE CLIQUÉE ============ */
let currentZoomOverlay = null;
let currentZoomClone = null;

function playIslandZoom(monthId, seasonKey, originEl, monthName, onDone){
  const rect = originEl.getBoundingClientRect();

  const overlay = document.createElement('div');
  overlay.className = 'zoom-overlay';
  document.body.appendChild(overlay);

  const clone = document.createElement('div');
  clone.className = 'zoom-clone';
  clone.style.left = rect.left+'px';
  clone.style.top = rect.top+'px';
  clone.style.width = rect.width+'px';
  clone.style.height = rect.height+'px';
  const st = monthStats(monthId);
  const cloudsHtml = `<div class="cloud-layer">${cloudPuffsHtml(st.pct, false)}</div>`;
  clone.innerHTML = `<img class="island-svg" src="${ISLAND_IMAGES[monthId]}" alt="${monthName}">` + cloudsHtml + `<div class="zoom-clone-label">${monthName}</div>`;
  document.body.appendChild(clone);

  // force reflow avant de déclencher la transition
  clone.getBoundingClientRect();

  // Le panneau de mois s'ouvre à droite : l'île zoomée se centre dans la zone restante à gauche.
  // Chaque clic sur l'île, une fois arrivée, la fait grossir un peu plus (3 paliers), puis revient à la taille normale.
  const ZOOM_LEVELS = [
    {wRatio:0.84, hRatio:0.64, cap:460},
    {wRatio:0.94, hRatio:0.82, cap:620},
    {wRatio:0.99, hRatio:0.95, cap:900}
  ];
  let zoomLevel = 0;
  function placeClone(level){
    const panelWidth = Math.max(300, Math.min(460, window.innerWidth*0.42));
    const leftAreaWidth = Math.max(window.innerWidth - panelWidth, window.innerWidth*0.3);
    const l = ZOOM_LEVELS[level];
    const size = Math.min(leftAreaWidth*l.wRatio, window.innerHeight*l.hRatio, l.cap);
    clone.style.left = (leftAreaWidth/2 - size/2)+'px';
    clone.style.top = (window.innerHeight/2 - size/2)+'px';
    clone.style.width = size+'px';
    clone.style.height = size+'px';
  }

  requestAnimationFrame(()=>{
    overlay.classList.add('show');
    placeClone(0);
    setTimeout(()=> clone.classList.add('arrived'), 520);
  });

  clone.addEventListener('click', (e)=>{
    if(!clone.classList.contains('arrived')) return;
    e.stopPropagation();
    zoomLevel = (zoomLevel + 1) % ZOOM_LEVELS.length;
    clone.classList.toggle('zoomed-in', zoomLevel > 0);
    placeClone(zoomLevel);
  });

  currentZoomOverlay = overlay;
  currentZoomClone = clone;

  // l'île reste affichée : on ouvre le panneau par-dessus une fois le zoom arrivé,
  // la suppression se fera à la fermeture du panneau (voir closeOverlay)
  setTimeout(onDone, 560);
}

function teardownZoom(){
  if(currentZoomOverlay){
    const o = currentZoomOverlay;
    o.classList.remove('show');
    setTimeout(()=>o.remove(), 400);
    currentZoomOverlay = null;
  }
  if(currentZoomClone){
    const c = currentZoomClone;
    c.style.transition = 'opacity .35s ease, transform .35s ease';
    c.style.opacity = '0';
    c.style.transform = 'scale(0.85)';
    setTimeout(()=>c.remove(), 380);
    currentZoomClone = null;
  }
}

const LORE_THRESHOLDS = [0, 34, 67]; // seuil (%) pour débloquer chapitres I, II, III
function loreChapterHtml(num, label, text, pct){
  const threshold = LORE_THRESHOLDS[num-1];
  const unlocked = pct >= threshold;
  if(unlocked){
    return `
      <div class="lore-chapter">
        <div class="lore-chapter-head">📖 ${label}</div>
        <div class="lore-text">${text}</div>
      </div>
    `;
  }
  return `
    <div class="lore-chapter">
      <div class="lore-chapter-head locked">🔒 ${label}</div>
      <div class="lore-locked">
        Se dévoile à ${threshold}% d'avancement
        <span class="lore-lock-bar"><span class="lore-lock-fill" style="width:${Math.min(100, pct/threshold*100)}%"></span></span>
      </div>
    </div>
  `;
}
function loreBoxHtml(monthId){
  const lore = ISLAND_LORE[monthId];
  if(!lore) return '';
  const pct = monthStats(monthId).pct;
  return `
    <div class="lore-box">
      <div class="lore-title title-font">${lore.title}</div>
      <div class="lore-subtitle">L'histoire de cette île se dévoile à mesure que tu avances.</div>
      ${loreChapterHtml(1, "I. Description de l'île", lore.p1, pct)}
      ${loreChapterHtml(2, "II. Êtres habitants", lore.p2, pct)}
      ${loreChapterHtml(3, "III. Histoire de l'île", lore.p3, pct)}
    </div>
  `;
}

let currentPanelMonth = null;
let panelTab = 'todo';

function switchPanelTab(tab){
  panelTab = tab;
  document.querySelectorAll('.panel-tab').forEach(b=> b.classList.toggle('active', b.dataset.tab===tab));
  document.querySelectorAll('.panel-view').forEach(v=> v.classList.toggle('active', v.dataset.view===tab));
}

function openMonth(monthId){
  const m = MONTHS[monthId];
  const projs = projectsForMonth(monthId);
  if(currentPanelMonth !== monthId){
    panelTab = 'todo'; // priorité à la to-do à chaque nouvelle ouverture d'île
    currentPanelMonth = monthId;
  }
  const panel = document.getElementById('month-panel');
  panel.innerHTML = `
    <div class="panel-head">
      <div class="emoji-big">${m.emoji}</div>
      <div>
        <h2 class="title-font">${m.name}</h2>
        <div class="meta">${projs.length} projet${projs.length>1?'s':''} sur ce mois</div>
      </div>
      <button class="close-btn" onclick="closeOverlay('month-overlay')">✕</button>
    </div>
    <div class="panel-tabs">
      <button class="panel-tab ${panelTab==='todo'?'active':''}" data-tab="todo" onclick="switchPanelTab('todo')">📋 To-do</button>
      <button class="panel-tab ${panelTab==='lore'?'active':''}" data-tab="lore" onclick="switchPanelTab('lore')">📖 Histoire</button>
    </div>
    <div class="panel-view ${panelTab==='todo'?'active':''}" data-view="todo">
      <div id="projects-list"></div>
    </div>
    <div class="panel-view ${panelTab==='lore'?'active':''}" data-view="lore">
      ${loreBoxHtml(monthId)}
    </div>
  `;
  const list = panel.querySelector('#projects-list');
  if(projs.length===0){
    list.innerHTML = `<p style="color:var(--muted); font-size:13.5px;">Aucun projet planifié ce mois-ci.</p>`;
  }
  projs.forEach(p=>{
    const percents = p.subs.map(subPercent);
    const avg = percents.length ? Math.round(percents.reduce((a,b)=>a+b,0)/percents.length) : 0;
    const card = document.createElement('div');
    card.className='project-card';
    card.innerHTML = `
      <div class="project-head">
        <div class="project-dot" style="background:${p.color}"></div>
        <div class="project-title">${p.name}</div>
        <div class="project-progress-mini">${avg}%</div>
      </div>
      <div id="subs-${p.id}"></div>
    `;
    list.appendChild(card);
    const subsWrap = card.querySelector('#subs-'+p.id);
    p.subs.forEach(sub=>{
      const pct = subPercent(sub);
      const hasChildren = sub.subsubs && sub.subsubs.length>0;
      const row = document.createElement('div');
      row.className='subcat-row';
      row.innerHTML = `
        <div class="subcat-top">
          <div class="subcat-name">${sub.name}</div>
          <div class="subcat-date">${sub.date}</div>
          <div class="subcat-pct" style="background:${pctColor(pct)}22; color:${pctColor(pct)}">${pct}%</div>
        </div>
        ${hasChildren ? '' : `
        <div class="subcat-controls">
          <select class="status-select">
            <option value="not_started" ${sub.status==='not_started'?'selected':''}>⚪ Pas commencé</option>
            <option value="in_progress" ${sub.status==='in_progress'?'selected':''}>🔵 En cours</option>
            <option value="done" ${sub.status==='done'?'selected':''}>✅ Terminé</option>
            <option value="transferred" ${sub.status==='transferred'?'selected':''}>🔁 Transféré équipe</option>
          </select>
          ${sub.status==='in_progress' ? `
            <input type="range" class="percent-range" min="0" max="100" step="5" value="${sub.percent ?? 50}">
            <span class="percent-live mono">${sub.percent ?? 50}%</span>
          ` : ''}
        </div>
        `}
        ${hasChildren ? `<div class="subsubs-wrap"></div>` : ''}
      `;
      if(!hasChildren){
        row.querySelector('.status-select').addEventListener('change', (e)=>updateSubStatus(p.id, sub.id, e.target.value));
        const range = row.querySelector('.percent-range');
        if(range){
          const live = row.querySelector('.percent-live');
          range.addEventListener('input', (e)=>{ live.textContent = e.target.value+'%'; });
          range.addEventListener('change', (e)=>updateSubPercent(p.id, sub.id, parseInt(e.target.value,10)));
        }
      } else {
        const subsubsWrap = row.querySelector('.subsubs-wrap');
        sub.subsubs.forEach(ss=>{
          const ssPct = leafPercent(ss);
          const ssRow = document.createElement('div');
          ssRow.className='subsubcat-row';
          ssRow.innerHTML = `
            <div class="subsubcat-top">
              <div class="subsubcat-name">${ss.name}</div>
              <div class="subcat-date">${ss.date}</div>
              <div class="subcat-pct" style="background:${pctColor(ssPct)}22; color:${pctColor(ssPct)}">${ssPct}%</div>
            </div>
            <div class="subcat-controls">
              <select class="status-select">
                <option value="not_started" ${ss.status==='not_started'?'selected':''}>⚪ Pas commencé</option>
                <option value="in_progress" ${ss.status==='in_progress'?'selected':''}>🔵 En cours</option>
                <option value="done" ${ss.status==='done'?'selected':''}>✅ Terminé</option>
                <option value="transferred" ${ss.status==='transferred'?'selected':''}>🔁 Transféré équipe</option>
              </select>
              ${ss.status==='in_progress' ? `
                <input type="range" class="percent-range" min="0" max="100" step="5" value="${ss.percent ?? 50}">
                <span class="percent-live mono">${ss.percent ?? 50}%</span>
              ` : ''}
            </div>
          `;
          ssRow.querySelector('.status-select').addEventListener('change', (e)=>updateSubSubStatus(p.id, sub.id, ss.id, e.target.value));
          const ssRange = ssRow.querySelector('.percent-range');
          if(ssRange){
            const ssLive = ssRow.querySelector('.percent-live');
            ssRange.addEventListener('input', (e)=>{ ssLive.textContent = e.target.value+'%'; });
            ssRange.addEventListener('change', (e)=>updateSubSubPercent(p.id, sub.id, ss.id, parseInt(e.target.value,10)));
          }
          subsubsWrap.appendChild(ssRow);
        });
      }
      subsWrap.appendChild(row);
    });
  });
  document.getElementById('month-overlay').classList.add('open', 'zoomed');
}
/* ============ DÉTAIL DES NIVEAUX ============ */
function openLevelDetail(){
  const s = globalStats();
  const panel = document.getElementById('level-panel');

  const progressPct = s.xpToNext.isMax ? 100 : Math.max(0, Math.min(100, Math.round((s.xp - s.xpToNext.current) / (s.xpToNext.next - s.xpToNext.current) * 100)));
  const remaining = s.xpToNext.isMax ? 0 : s.xpToNext.next - s.xp;

  const ladderHtml = LEVEL_NAMES.map((name, i)=>{
    const lvl = i+1;
    const threshold = LEVEL_THRESHOLDS[i];
    const state = lvl < s.level ? 'done' : (lvl === s.level ? 'current' : '');
    const icon = lvl < s.level ? '✓' : lvl;
    return `
      <div class="level-row ${state}">
        <div class="level-row-num">${icon}</div>
        <div class="level-row-info">
          <div class="level-row-name">${name}</div>
          <div class="level-row-req">à partir de ${threshold} XP</div>
        </div>
      </div>
    `;
  }).join('');

  panel.innerHTML = `
    <div class="panel-head">
      <div class="emoji-big">🏆</div>
      <div>
        <h2 class="title-font">Ta progression</h2>
        <div class="meta">Niveau ${s.level} sur ${LEVEL_NAMES.length}</div>
      </div>
      <button class="close-btn" onclick="closeOverlay('level-overlay')">✕</button>
    </div>
    <div class="level-hero">
      <div class="level-hero-name title-font">${levelName(s.level)}</div>
      <div class="level-hero-xp">${s.xp} XP au total</div>
      <div class="level-progress-track"><div class="level-progress-fill" style="width:${progressPct}%"></div></div>
      <div class="level-progress-caption">
        ${s.xpToNext.isMax
          ? "Niveau maximum atteint 👑"
          : `${remaining} XP avant <strong>${levelName(s.level+1)}</strong>`}
      </div>
    </div>
    <div class="level-ladder">${ladderHtml}</div>
  `;
  document.getElementById('level-overlay').classList.add('open');
}
document.getElementById('level-overlay').addEventListener('click', (e)=>{ if(e.target.id==='level-overlay') closeOverlay('level-overlay'); });

function closeOverlay(id){
  document.getElementById(id).classList.remove('open');
  if(id==='month-overlay'){
    document.getElementById('month-overlay').classList.remove('zoomed');
    teardownZoom();
    currentPanelMonth = null;
  }
}

/* ============ INTERACTIONS ============ */
function updateSubStatus(projectId, subId, newStatus){
  const project = PROJECTS.find(p=>p.id===projectId);
  const sub = project.subs.find(s=>s.id===subId);
  const oldPct = subPercent(sub);
  sub.status = newStatus;
  if(newStatus==='in_progress' && sub.percent===undefined) sub.percent = STATUS_META.in_progress.pctDefault;
  const newPct = subPercent(sub);
  if(newPct>oldPct) showToast(newStatus==='done' ? '✅' : (newStatus==='transferred' ? '🔁' : '🔵'), `${sub.name} → ${STATUS_META[newStatus].short}`);

  checkMilestones(project);
  refreshAll();
  openMonth(project.month);
  checkBadges();
  markWeekActive();
}
function updateSubPercent(projectId, subId, value){
  const project = PROJECTS.find(p=>p.id===projectId);
  const sub = project.subs.find(s=>s.id===subId);
  sub.percent = value;
  checkMilestones(project);
  refreshAll();
  openMonth(project.month);
  checkBadges();
  markWeekActive();
}
function updateSubSubStatus(projectId, subId, subsubId, newStatus){
  const project = PROJECTS.find(p=>p.id===projectId);
  const sub = project.subs.find(s=>s.id===subId);
  const subsub = sub.subsubs.find(ss=>ss.id===subsubId);
  subsub.status = newStatus;
  if(newStatus==='in_progress' && subsub.percent===undefined) subsub.percent = STATUS_META.in_progress.pctDefault;
  checkMilestones(project);
  refreshAll();
  openMonth(project.month);
  checkBadges();
  markWeekActive();
}
function updateSubSubPercent(projectId, subId, subsubId, value){
  const project = PROJECTS.find(p=>p.id===projectId);
  const sub = project.subs.find(s=>s.id===subId);
  const subsub = sub.subsubs.find(ss=>ss.id===subsubId);
  subsub.percent = value;
  checkMilestones(project);
  refreshAll();
  openMonth(project.month);
  markWeekActive();
  checkBadges();
}
function checkMilestones(project){
  if(project.subs.length>0 && project.subs.every(subIsDone)){
    showToast('🎯', `Projet terminé : ${project.name}`);
    const stMonth = monthStats(project.month);
    if(stMonth.total>0 && stMonth.doneCount===stMonth.total){
      setTimeout(()=>showToast('🏝️', `${MONTHS[project.month].name} totalement dévoilé !`), 500);
    }
  }
}
function showToast(emoji, text){
  const zone = document.getElementById('toast-zone');
  const t = document.createElement('div');
  t.className='toast';
  t.innerHTML = `<span>${emoji}</span><span>${text}</span>`;
  zone.appendChild(t);
  setTimeout(()=>t.remove(), 3000);
}
let unlockedAnimals = new Set();
// Réévalue chaque badge à chaque appel (pas seulement "ajouter si nouvellement gagné") :
// un badge dont la condition n'est plus vraie (ex : projet supprimé, correctif d'une
// règle de calcul) est retiré au lieu de rester débloqué à tort indéfiniment.
function checkBadges(){
  const s = globalStats();
  let changed = false;
  ANIMAL_BADGES.forEach((b, idx)=>{
    const earned = b.test(s);
    if(earned && !unlockedAnimals.has(idx)){
      unlockedAnimals.add(idx);
      changed = true;
      const animal = ANIMAL_IMAGES[b.animalIndex];
      setTimeout(()=>showToast('🐾', `Nouveau compagnon débloqué : ${animal.name}`), 900);
    } else if(!earned && unlockedAnimals.has(idx)){
      unlockedAnimals.delete(idx);
      changed = true;
    }
  });
  renderBadgeCounts();
  renderBadgesSection();
  if(changed) scheduleSave(getAppStateSnapshot);
}
function renderBadgeCounts(){
  const count = unlockedAnimals.size;
  document.getElementById('badge-count-num').textContent = count;
  document.getElementById('badges-section-count').textContent = count+' / '+ANIMAL_BADGES.length;
}
function renderBadgesSection(){
  const grid = document.getElementById('badges-grid-static');
  grid.innerHTML = '';
  ANIMAL_BADGES.forEach((b, idx)=>{
    const unlocked = unlockedAnimals.has(idx);
    const animal = ANIMAL_IMAGES[b.animalIndex];
    const tile = document.createElement('div');
    tile.className = 'badge-tile '+(unlocked?'unlocked':'locked');
    tile.innerHTML = `
      <div class="badge-tile-img-wrap">
        <img class="badge-tile-img" src="${animal.src}" alt="${animal.name}">
        ${!unlocked ? '<div class="badge-tile-lock">🔒</div>' : ''}
      </div>
      <div class="name">${unlocked ? animal.name : '???'}</div>
      <div class="month-tag">${b.desc}</div>
    `;
    grid.appendChild(tile);
  });
}
function refreshAll(){ buildMap(); renderBadgeCounts(); scheduleSave(getAppStateSnapshot); }

/* ============ RÉGULARITÉ : collection de pierres, une par semaine (52) ============ */
// Récompense l'utilisation régulière de l'outil (au moins une action par semaine),
// indépendamment de l'avancement des projets eux-mêmes.
// Les 52 pierres sont groupées par 4 semaines ; chaque groupe débloque un nouvel
// élément (illustration) au fil du temps, indépendamment de la validation.
// `src` = pierre "au repos" (non validée), `srcActive` = pierre validée (version éclatante).
// Tableau à taille fixe (13 = 52 semaines / 4) indexé par position ; les positions pas
// encore reçues restent vides et retombent sur STONE_PLACEHOLDER (voir plus bas).
const STONE_PLACEHOLDER = {name:'Élément à venir', src:'assets/stones/00_initial_stone.png', srcActive:'assets/stones/00_initial_stone_y.png'};
const STONE_ELEMENTS = new Array(13);
STONE_ELEMENTS[0] = {name:'Initial', src:'assets/stones/00_initial_stone.png', srcActive:'assets/stones/00_initial_stone_y.png'};
STONE_ELEMENTS[1] = {name:'Neige',   src:'assets/stones/01_neige.png',         srcActive:'assets/stones/01_neige_y.png'};
STONE_ELEMENTS[2] = {name:'Givre',   src:'assets/stones/02_givre.png',         srcActive:'assets/stones/02_givre_y.png'};
STONE_ELEMENTS[3] = {name:'Vent',    src:'assets/stones/03_vent.png',          srcActive:'assets/stones/03_vent_y.png'};
STONE_ELEMENTS[4] = {name:'Feuille', src:'assets/stones/04_feuille.png',       srcActive:'assets/stones/04_feuille_y.png'};
STONE_ELEMENTS[5] = {name:'Fleurs',  src:'assets/stones/05_fleurs.png',        srcActive:'assets/stones/05_fleurs_y.png'};
STONE_ELEMENTS[8] = {name:'Feu',     src:'assets/stones/08_feu.png',           srcActive:'assets/stones/08_feu_y.png'};
STONE_ELEMENTS[9] = {name:'Ombre',   src:'assets/stones/10_ombre.png',         srcActive:'assets/stones/10_ombre_y.png'};
let activityWeeks = new Set(); // clés "AAAA-wN" (N de 0 à 51)
function weekIndexOfYear(date){
  const start = new Date(date.getFullYear(), 0, 1);
  const diffDays = Math.floor((date - start) / 86400000);
  return Math.min(51, Math.floor(diffDays/7));
}
function currentWeekKey(){
  const now = new Date();
  return now.getFullYear()+'-w'+weekIndexOfYear(now);
}
// Appelée à chaque action qui compte comme "utilisation de l'outil" : mise à jour d'un
// statut, ajout d'un projet/sous-catégorie/sous-sous-catégorie, ajout d'un commentaire.
function markWeekActive(){
  const key = currentWeekKey();
  if(activityWeeks.has(key)) return;
  activityWeeks.add(key);
  renderActivityBar();
  scheduleSave(getAppStateSnapshot);
}
function currentStoneGroup(){
  return Math.floor(weekIndexOfYear(new Date())/4);
}
function renderActivityBar(){
  const bar = document.getElementById('activity-bar');
  const countEl = document.getElementById('activity-count');
  if(!bar) return;
  const now = new Date();
  const year = now.getFullYear();
  const currentIdx = weekIndexOfYear(now);
  const currentGroup = currentStoneGroup();
  let doneCount = 0;
  let html = '';
  for(let w=0; w<52; w++){
    const active = activityWeeks.has(year+'-w'+w);
    if(active) doneCount++;
    const isCurrent = w===currentIdx;
    const isPast = w<currentIdx;
    const group = Math.floor(w/4);
    const unlocked = group<=currentGroup;
    const el = STONE_ELEMENTS[group % STONE_ELEMENTS.length] || STONE_PLACEHOLDER;
    let cls = 'activity-dot';
    let title;
    if(active){ cls += ' active'; title = `Semaine ${w+1} — pierre de ${el.name} — action faite ✓`; }
    else if(isCurrent){ cls += ' current'; title = `Semaine ${w+1} — pierre de ${el.name} — en cours, pas encore d'action`; }
    else if(isPast){ cls += ' missed'; title = `Semaine ${w+1} — pierre de ${el.name} — manquée`; }
    else { cls += ' future'; title = unlocked ? `Semaine ${w+1} — pierre de ${el.name} — à venir` : `Semaine ${w+1} — élément à débloquer dans ${group*4-currentIdx} semaine(s)`; }
    if(!unlocked) cls += ' locked';
    const src = active ? el.srcActive : el.src;
    html += `<div class="${cls}" title="${title}"><img class="activity-dot-img" src="${src}" alt=""></div>`;
  }
  bar.innerHTML = html;
  if(countEl) countEl.textContent = doneCount+' / 52 semaines';
}

document.getElementById('badge-count-btn').addEventListener('click', ()=>{
  document.querySelector('.badges-section').scrollIntoView({behavior:'smooth', block:'start'});
});
document.getElementById('month-overlay').addEventListener('click', (e)=>{ if(e.target.id==='month-overlay') closeOverlay('month-overlay'); });

/* ============ MENU : COLLECTIONS (vue d'ensemble + agrandissement) ============ */
let collectionsTab = 'animals';
function openCollectionsPanel(tab){
  collectionsTab = tab || collectionsTab;
  renderCollectionsPanel();
  document.getElementById('collections-overlay').classList.add('open');
}
function switchCollectionsTab(tab){
  collectionsTab = tab;
  renderCollectionsPanel();
}
function collectionTileHtml(src, name, desc, unlocked){
  const zoomAttr = unlocked ? ` onclick="openLightbox('${src}', '${name.replace(/'/g,"\\'")}')"` : '';
  return `
    <div class="badge-tile ${unlocked?'unlocked':'locked'}">
      <div class="badge-tile-img-wrap">
        <img class="badge-tile-img" src="${src}" alt="${name}"${zoomAttr}>
        ${!unlocked ? '<div class="badge-tile-lock">🔒</div>' : ''}
      </div>
      <div class="name">${unlocked ? name : '???'}</div>
      <div class="month-tag">${desc}</div>
    </div>
  `;
}
function renderCollectionsPanel(){
  const panel = document.getElementById('collections-panel');
  const currentGroup = currentStoneGroup();

  const animalsHtml = ANIMAL_BADGES.map((b, idx)=>{
    const unlocked = unlockedAnimals.has(idx);
    const animal = ANIMAL_IMAGES[b.animalIndex];
    return collectionTileHtml(animal.src, animal.name, b.desc, unlocked);
  }).join('');

  const stonesHtml = Array.from({length: STONE_ELEMENTS.length}, (_, idx)=>{
    const el = STONE_ELEMENTS[idx] || STONE_PLACEHOLDER;
    const unlocked = idx<=currentGroup;
    const desc = unlocked ? 'Débloquée' : `Se débloque à la semaine ${idx*4+1}`;
    return collectionTileHtml(unlocked ? el.srcActive : el.src, el.name, desc, unlocked);
  }).join('');

  panel.innerHTML = `
    <div class="panel-head">
      <div class="emoji-big">🗂️</div>
      <div>
        <h2 class="title-font">Tes collections</h2>
        <div class="meta">Clique sur une image débloquée pour l'agrandir</div>
      </div>
      <button class="close-btn" onclick="closeOverlay('collections-overlay')">✕</button>
    </div>
    <div class="panel-tabs">
      <button class="panel-tab ${collectionsTab==='animals'?'active':''}" data-tab="animals" onclick="switchCollectionsTab('animals')">🦊 Animaux (${unlockedAnimals.size}/${ANIMAL_BADGES.length})</button>
      <button class="panel-tab ${collectionsTab==='stones'?'active':''}" data-tab="stones" onclick="switchCollectionsTab('stones')">💎 Pierres (${Math.min(currentGroup+1, STONE_ELEMENTS.length)}/${STONE_ELEMENTS.length})</button>
    </div>
    <div class="panel-view ${collectionsTab==='animals'?'active':''}" data-view="animals">
      <div class="badges-grid">${animalsHtml}</div>
    </div>
    <div class="panel-view ${collectionsTab==='stones'?'active':''}" data-view="stones">
      <div class="badges-grid">${stonesHtml}</div>
    </div>
  `;
}
document.getElementById('collections-overlay').addEventListener('click', (e)=>{ if(e.target.id==='collections-overlay') closeOverlay('collections-overlay'); });

function openLightbox(src, title){
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox-caption').textContent = title || '';
  document.getElementById('lightbox-overlay').classList.add('open');
}
function closeLightbox(){
  document.getElementById('lightbox-overlay').classList.remove('open');
}
document.getElementById('lightbox-overlay').addEventListener('click', (e)=>{ if(e.target.id==='lightbox-overlay') closeLightbox(); });
document.getElementById('lightbox-img').addEventListener('click', closeLightbox);
document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeLightbox(); });

document.getElementById('menu-collections-btn').addEventListener('click', ()=> openCollectionsPanel('animals'));
document.getElementById('menu-level-btn').addEventListener('click', openLevelDetail);
document.getElementById('menu-todo-btn').addEventListener('click', ()=>{ showToast('🧭','Ouverture de ta to-do complète…'); openFullTodoTab(); });

/* ============ NOUVEL ONGLET : to-do complète (page de travail interactive) ============ */
function openFullTodoTab(){
  const initialData = JSON.stringify(PROJECTS);
  const monthsJson = JSON.stringify(MONTHS);
  const seasonsJson = JSON.stringify(SEASONS);

  const html = [
'<!DOCTYPE html>',
'<html lang="fr"><head><meta charset="UTF-8"><title>Toute ma to-do — Année</title>',
'<style>',
"@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');",
':root{ --ink:#0b0f1f; --panel:#141a30; --gold:#f0c15c; --white:#eef3fb; --muted:#93a0c4;',
'  --st-not:#5b6b8c; --st-progress:#f2b23b; --st-done:#7fd68a; --st-transfer:#6ec6e8; }',
'*{box-sizing:border-box;}',
"body{margin:0; background:linear-gradient(180deg,#0d1b3a,#16305e 40%,#1a2740); color:var(--white); font-family:'Nunito Sans',sans-serif; min-height:100vh;}",
".title-font{font-family:'Fredoka',sans-serif;} .mono{font-family:'JetBrains Mono',monospace;}",
'.wrap{max-width:820px; margin:0 auto; padding:36px 22px 90px;}',
'h1{font-size:24px; margin:0 0 4px;}',
'.subtitle{color:var(--muted); font-size:13.5px; margin-bottom:22px;}',
'.sync-note{font-size:11.5px; color:var(--muted); background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:8px 12px; margin-bottom:22px;}',
'.score-bar{display:flex; gap:22px; align-items:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:16px; padding:16px 20px; margin-bottom:28px;}',
'.score-num{font-family:\'JetBrains Mono\',monospace; font-size:24px; font-weight:700; color:var(--gold);}',
'.score-label{font-size:10.5px; color:var(--muted); text-transform:uppercase; letter-spacing:0.07em;}',
'.month{margin-bottom:22px;}',
'.month-title{display:flex; align-items:center; gap:8px; font-size:15.5px; font-weight:600; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.08); margin-bottom:10px; cursor:pointer; user-select:none;}',
'.month-arrow{display:inline-flex; transition:transform 0.18s ease; flex-shrink:0; font-size:11px; color:var(--muted);}',
'.month-arrow.collapsed{transform:rotate(-90deg);}',
'.month-body.collapsed{display:none;}',
'.archive-btn{background:none; border:none; color:var(--muted); cursor:pointer; font-size:13px; padding:2px 6px; border-radius:6px;}',
'.archive-btn:hover{color:var(--gold); background:rgba(240,193,92,0.12);}',
'.archived-section{margin-top:34px; padding-top:18px; border-top:1px solid rgba(255,255,255,0.1);}',
'.archived-title{display:flex; align-items:center; gap:8px; font-size:15px; font-weight:600; color:var(--muted); cursor:pointer; user-select:none; margin-bottom:12px;}',
'.archived-body.collapsed{display:none;}',
'.archived-project{opacity:0.62; border-style:dashed;}',
'.archived-project:hover{opacity:0.85;}',
'.archived-month-tag{font-size:10.5px; color:var(--muted); font-family:\'JetBrains Mono\',monospace; margin-right:6px;}',
'.unarchive-btn{background:none; border:1px solid rgba(255,255,255,0.18); color:var(--white); cursor:pointer; font-size:11px; padding:4px 9px; border-radius:8px; font-weight:700;}',
'.unarchive-btn:hover{border-color:var(--gold); color:var(--gold);}',
'.mdot{width:9px;height:9px;border-radius:50%; flex-shrink:0;}',
'.mstat{margin-left:auto; font-family:\'JetBrains Mono\',monospace; font-size:12px; color:var(--muted); font-weight:400;}',
'.project{background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:12px; padding:14px 16px; margin-bottom:10px; transition:opacity 0.15s, border-color 0.15s;}',
'.project[draggable="true"]{cursor:grab;}',
'.project.dragging{opacity:0.35; border-style:dashed;}',
'.drag-handle{color:var(--muted); font-size:13px; cursor:grab; flex-shrink:0; line-height:1;}',
'.month.drag-over{outline:2px dashed var(--gold); outline-offset:4px; background:rgba(240,193,92,0.06); border-radius:14px;}',
'.project-head{display:flex; align-items:center; gap:8px; margin-bottom:10px;}',
'.pdot{width:9px;height:9px;border-radius:50%; flex-shrink:0;}',
'.project-title{font-weight:700; font-size:14px; flex:1;}',
'.project-pct{font-size:11px; color:var(--muted); font-family:\'JetBrains Mono\',monospace;}',
'.del-btn{background:none; border:none; color:var(--muted); cursor:pointer; font-size:13px; padding:2px 6px; border-radius:6px;}',
'.del-btn:hover{color:#ef7b6a; background:rgba(239,123,106,0.1);}',
'.subcat-row{padding:9px 0; border-top:1px dashed rgba(255,255,255,0.07);}',
'.subcat-row:first-of-type{border-top:none;}',
'.subcat-top{display:flex; align-items:center; gap:8px; margin-bottom:6px;}',
'.subcat-name{flex:1; font-size:13px; font-weight:600;}',
'.subcat-date{font-size:10.5px; color:var(--muted); font-family:\'JetBrains Mono\',monospace;}',
'.subcat-pct{font-size:11px; font-weight:800; font-family:\'JetBrains Mono\',monospace; padding:2px 7px; border-radius:8px; min-width:34px; text-align:center;}',
'.subcat-controls{display:flex; align-items:center; gap:8px; flex-wrap:wrap;}',
'.status-select{background:rgba(255,255,255,0.06); color:var(--white); border:1px solid rgba(255,255,255,0.14); border-radius:8px; padding:5px 8px; font-size:12px; font-family:\'Nunito Sans\',sans-serif; cursor:pointer;}',
'.percent-range{flex:1; min-width:70px; accent-color:var(--gold);}',
'.percent-live{font-size:11px; color:var(--muted); font-family:\'JetBrains Mono\',monospace; width:32px; text-align:right;}',
'.rename-btn{background:none; border:none; color:var(--muted); cursor:pointer; font-size:13px; padding:2px 6px; border-radius:6px;}',
'.rename-btn:hover{color:var(--gold); background:rgba(240,193,92,0.12);}',
'.move-btn{background:none; border:none; color:var(--muted); cursor:pointer; font-size:11px; padding:2px 5px; border-radius:6px; line-height:1;}',
'.move-btn:hover:not(:disabled){color:var(--gold); background:rgba(240,193,92,0.12);}',
'.move-btn:disabled{opacity:0.2; cursor:default;}',
'.subsubs-wrap{margin-top:6px; padding-left:14px; border-left:2px solid rgba(255,255,255,0.08);}',
'.subsubcat-row{padding:7px 0; border-top:1px dashed rgba(255,255,255,0.06);}',
'.subsubcat-row:first-of-type{border-top:none;}',
'.subsubcat-top{display:flex; align-items:center; gap:6px; margin-bottom:5px;}',
'.subsubcat-name{flex:1; font-size:12px; font-weight:600; color:var(--muted);}',
'.subsub-add-row{margin-top:6px;}',
'.add-row{margin-top:8px;}',
'.add-link{background:none; border:none; color:var(--gold); font-size:12.5px; font-weight:700; cursor:pointer; padding:4px 0;}',
'.add-form{display:none; gap:8px; margin-top:8px; flex-wrap:wrap; align-items:center;}',
'.add-form.open{display:flex;}',
'.add-form input{background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.16); color:var(--white); border-radius:8px; padding:7px 10px; font-size:13px; font-family:\'Nunito Sans\',sans-serif;}',
'.add-form input.name{flex:1; min-width:140px;}',
'.add-form input.date{width:110px;}',
'.add-form button{background:var(--gold); border:none; color:#3a2a08; font-weight:800; font-size:12.5px; padding:7px 14px; border-radius:8px; cursor:pointer;}',
'.month-add{margin-top:6px;}',
'.comment-toggle{cursor:pointer; font-size:11px; color:var(--muted); margin-top:6px; display:inline-block;}',
'.comment-toggle:hover{color:var(--gold);}',
'.comments-panel{display:none; margin-top:8px; padding-top:8px; border-top:1px dashed rgba(255,255,255,0.08);}',
'.comments-panel.open{display:block;}',
'.comment-item{background:rgba(255,255,255,0.04); border-radius:8px; padding:7px 9px; margin-bottom:6px;}',
'.comment-text{font-size:12.5px; line-height:1.4; margin-bottom:4px; word-break:break-word;}',
'.comment-meta{font-size:10px; color:var(--muted); display:flex; justify-content:space-between; align-items:center; gap:8px;}',
'.comment-del{background:none; border:none; color:var(--muted); cursor:pointer; font-size:11px; padding:2px 4px;}',
'.comment-del:hover{color:#ef7b6a;}',
'.comment-add-row{display:flex; gap:6px; margin-top:6px;}',
'.comment-input{flex:1; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.16); color:var(--white); border-radius:8px; padding:7px 10px; font-size:12.5px; font-family:\'Nunito Sans\',sans-serif;}',
'.comment-add-row button{background:var(--gold); border:none; color:#3a2a08; font-weight:800; font-size:11.5px; padding:7px 13px; border-radius:8px; cursor:pointer; flex-shrink:0;}',
'::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.18); border-radius:3px;}',
'</style></head>',
'<body>',
'<div class="wrap">',
'  <h1 class="title-font">📋 Toute ma to-do — Année</h1>',
'  <div class="subtitle">Ajoute des projets, des sous-catégories, et fais avancer leur état directement ici.</div>',
'  <div class="sync-note">🔄 Les modifications faites ici se répercutent automatiquement sur la carte de l\'archipel, tant que cet onglet reste ouvert.</div>',
'  <div class="score-bar" id="score-bar"></div>',
'  <div id="months-container"></div>',
'  <div id="archived-container"></div>',
'</div>',
'<script>',
'var MONTHS = ' + monthsJson + ';',
'var SEASONS = ' + seasonsJson + ';',
'var STATUS_META = {',
'  not_started: {short:"Non démarré", pct:0, color:"var(--st-not)"},',
'  in_progress: {short:"En cours", pctDefault:50, color:"var(--st-progress)"},',
'  done: {short:"Terminé", pct:100, color:"var(--st-done)"},',
'  transferred: {short:"Transféré équipe", pct:95, color:"var(--st-transfer)"}',
'};',
'var DATA = ' + initialData + ';',
'',
'function leafPercent(item){',
'  if(item.status==="in_progress") return (item.percent===undefined?50:item.percent);',
'  return STATUS_META[item.status].pct;',
'}',
'function subPercent(sub){',
'  if(sub.subsubs && sub.subsubs.length){',
'    var sum=0; sub.subsubs.forEach(function(ss){ sum+=leafPercent(ss); });',
'    return Math.round(sum/sub.subsubs.length);',
'  }',
'  return leafPercent(sub);',
'}',
'function subIsDone(sub){',
'  if(sub.subsubs && sub.subsubs.length) return sub.subsubs.every(function(ss){return ss.status==="done";});',
'  return sub.status==="done";',
'}',
'function pctColorAgg(pct){',
'  if(pct>=100) return "var(--st-done)";',
'  if(pct>=95) return "var(--st-transfer)";',
'  if(pct>0) return "var(--st-progress)";',
'  return "var(--st-not)";',
'}',
'function newId(prefix){ return prefix + Date.now().toString(36) + Math.floor(Math.random()*1000); }',
'function projectsForMonth(m){ return DATA.filter(function(p){ return p.month===m && !p.archived; }); }',
'function archivedProjects(){ return DATA.filter(function(p){ return p.archived; }); }',
'function effectiveSubs(p){ return p.subs.length ? p.subs : [{status:"not_started"}]; }',
'function monthPct(m){',
'  var projs = projectsForMonth(m);',
'  var subs = [];',
'  projs.forEach(function(p){ subs = subs.concat(effectiveSubs(p)); });',
'  if(subs.length===0) return 0;',
'  var sum = 0; subs.forEach(function(s){ sum += subPercent(s); });',
'  return Math.round(sum/subs.length);',
'}',
'function projectPct(p){',
'  if(p.subs.length===0) return 0;',
'  var sum = 0; p.subs.forEach(function(s){ sum += subPercent(s); });',
'  return Math.round(sum/p.subs.length);',
'}',
'function globalPct(){',
'  var subs = []; DATA.forEach(function(p){ if(!p.archived) subs = subs.concat(effectiveSubs(p)); });',
'  if(subs.length===0) return 0;',
'  var sum = 0; subs.forEach(function(s){ sum += subPercent(s); });',
'  return Math.round(sum/subs.length);',
'}',
'function globalXp(){',
'  var subs = []; DATA.forEach(function(p){ if(!p.archived) subs = subs.concat(effectiveSubs(p)); });',
'  var xp = 0; subs.forEach(function(s){ xp += subPercent(s)/100*20; });',
'  var projectsDone = DATA.filter(function(p){ return !p.archived && p.subs.length>0 && p.subs.every(subIsDone); }).length;',
'  var monthsDone = MONTHS.filter(function(m){',
'    var subs2 = []; projectsForMonth(m.id).forEach(function(p){ subs2 = subs2.concat(effectiveSubs(p)); });',
'    return subs2.length>0 && subs2.every(subIsDone);',
'  }).length;',
'  return Math.round(xp) + projectsDone*60 + monthsDone*100;',
'}',
'function sync(markActive){',
'  var target = window.opener || (window.parent !== window ? window.parent : null);',
'  if(target){ target.postMessage({type:"archipel-sync", projects: DATA, markActive: !!markActive}, "*"); }',
'}',
'',
'function setStatus(projId, subId, val){',
'  var p = DATA.find(function(x){return x.id===projId;});',
'  var s = p.subs.find(function(x){return x.id===subId;});',
'  s.status = val;',
'  if(val==="in_progress" && s.percent===undefined) s.percent = 50;',
'  render(); sync(true);',
'}',
'function setPercentLive(subId, val){',
'  var el = document.getElementById("live-"+subId);',
'  if(el) el.textContent = val + "%";',
'}',
'function setPercent(projId, subId, val){',
'  var p = DATA.find(function(x){return x.id===projId;});',
'  var s = p.subs.find(function(x){return x.id===subId;});',
'  s.percent = parseInt(val,10);',
'  render(); sync(true);',
'}',
'function toggleForm(id){',
'  var el = document.getElementById(id);',
'  if(el) el.classList.toggle("open");',
'}',
'var openComments = {};',
'function toggleComments(subId){',
'  openComments[subId] = !openComments[subId];',
'  render();',
'}',
'var collapsedMonths = {};',
'function toggleMonth(monthId){',
'  collapsedMonths[monthId] = !collapsedMonths[monthId];',
'  render();',
'}',
'function addComment(projId, subId){',
'  var input = document.getElementById("comment-input-"+subId);',
'  var text = input.value.trim();',
'  if(!text) return;',
'  var p = DATA.find(function(x){return x.id===projId;});',
'  var s = p.subs.find(function(x){return x.id===subId;});',
'  if(!s.comments) s.comments = [];',
'  var now = new Date();',
'  var dateStr = now.toLocaleDateString("fr-FR",{day:"2-digit",month:"short"}) + " à " + now.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});',
'  s.comments.push({text: text, date: dateStr});',
'  openComments[subId] = true;',
'  render(); sync(true);',
'}',
'function deleteComment(projId, subId, idx){',
'  var p = DATA.find(function(x){return x.id===projId;});',
'  var s = p.subs.find(function(x){return x.id===subId;});',
'  s.comments.splice(idx,1);',
'  render(); sync();',
'}',
'function commentKeydown(event, projId, subId){',
'  if(event.key==="Enter"){ addComment(projId, subId); }',
'}',
'function addProject(monthId){',
'  var input = document.getElementById("newproj-"+monthId);',
'  var name = input.value.trim();',
'  if(!name) return;',
'  var season = MONTHS.find(function(m){return m.id===monthId;}).season;',
'  var color = SEASONS[season].color;',
'  DATA.push({id:newId("p"), month:monthId, name:name, color:color, subs:[]});',
'  input.value = "";',
'  render(); sync(true);',
'}',
'function deleteProject(projId){',
'  DATA = DATA.filter(function(p){return p.id!==projId;});',
'  render(); sync();',
'}',
'function moveProjectToMonth(projId, monthId){',
'  var p = DATA.find(function(x){return x.id===projId;});',
'  if(!p || p.month===monthId) return;',
'  p.month = monthId;',
'  p.color = SEASONS[MONTHS.find(function(m){return m.id===monthId;}).season].color;',
'  render(); sync();',
'}',
'var draggedProjectId = null;',
'function onProjectDragStart(e, projId){',
'  draggedProjectId = projId;',
'  e.dataTransfer.effectAllowed = "move";',
'  try { e.dataTransfer.setData("text/plain", projId); } catch(err){}',
'  e.currentTarget.classList.add("dragging");',
'}',
'function onProjectDragEnd(e){',
'  e.currentTarget.classList.remove("dragging");',
'  draggedProjectId = null;',
'}',
'function onMonthDragOver(e){',
'  if(!draggedProjectId) return;',
'  e.preventDefault();',
'  e.dataTransfer.dropEffect = "move";',
'  e.currentTarget.classList.add("drag-over");',
'}',
'function onMonthDragLeave(e){',
'  if(e.currentTarget.contains(e.relatedTarget)) return;',
'  e.currentTarget.classList.remove("drag-over");',
'}',
'function onMonthDrop(e, monthId){',
'  e.preventDefault();',
'  e.currentTarget.classList.remove("drag-over");',
'  var projId = draggedProjectId || e.dataTransfer.getData("text/plain");',
'  if(projId) moveProjectToMonth(projId, monthId);',
'  draggedProjectId = null;',
'}',
'function archiveProject(projId){',
'  var p = DATA.find(function(x){return x.id===projId;});',
'  p.archived = true;',
'  render(); sync();',
'}',
'function unarchiveProject(projId){',
'  var p = DATA.find(function(x){return x.id===projId;});',
'  p.archived = false;',
'  render(); sync();',
'}',
'var archivedCollapsed = true;',
'function toggleArchivedSection(){',
'  archivedCollapsed = !archivedCollapsed;',
'  render();',
'}',
'function addSub(projId){',
'  var nameInput = document.getElementById("newsub-name-"+projId);',
'  var dateInput = document.getElementById("newsub-date-"+projId);',
'  var name = nameInput.value.trim();',
'  if(!name) return;',
'  var date = dateInput.value.trim() || "—";',
'  var p = DATA.find(function(x){return x.id===projId;});',
'  p.subs.push({id:newId("s"), name:name, date:date, status:"not_started"});',
'  nameInput.value=""; dateInput.value="";',
'  render(); sync(true);',
'}',
'function deleteSub(projId, subId){',
'  var p = DATA.find(function(x){return x.id===projId;});',
'  p.subs = p.subs.filter(function(s){return s.id!==subId;});',
'  render(); sync();',
'}',
'function moveSub(projId, subId, dir){',
'  var p = DATA.find(function(x){return x.id===projId;});',
'  var idx = p.subs.findIndex(function(s){return s.id===subId;});',
'  var target = idx + dir;',
'  if(idx===-1 || target<0 || target>=p.subs.length) return;',
'  var tmp = p.subs[target]; p.subs[target] = p.subs[idx]; p.subs[idx] = tmp;',
'  render(); sync();',
'}',
'function addSubsub(projId, subId){',
'  var nameInput = document.getElementById("newsubsub-name-"+subId);',
'  var dateInput = document.getElementById("newsubsub-date-"+subId);',
'  var name = nameInput.value.trim();',
'  if(!name) return;',
'  var date = dateInput.value.trim() || "—";',
'  var p = DATA.find(function(x){return x.id===projId;});',
'  var s = p.subs.find(function(x){return x.id===subId;});',
'  if(!s.subsubs) s.subsubs = [];',
'  s.subsubs.push({id:newId("ss"), name:name, date:date, status:"not_started"});',
'  nameInput.value=""; dateInput.value="";',
'  render(); sync(true);',
'}',
'function deleteSubsub(projId, subId, subsubId){',
'  var p = DATA.find(function(x){return x.id===projId;});',
'  var s = p.subs.find(function(x){return x.id===subId;});',
'  s.subsubs = s.subsubs.filter(function(ss){return ss.id!==subsubId;});',
'  render(); sync();',
'}',
'function setSubsubStatus(projId, subId, subsubId, val){',
'  var p = DATA.find(function(x){return x.id===projId;});',
'  var s = p.subs.find(function(x){return x.id===subId;});',
'  var ss = s.subsubs.find(function(x){return x.id===subsubId;});',
'  ss.status = val;',
'  if(val==="in_progress" && ss.percent===undefined) ss.percent = 50;',
'  render(); sync(true);',
'}',
'function setSubsubPercentLive(subsubId, val){',
'  var el = document.getElementById("live-ss-"+subsubId);',
'  if(el) el.textContent = val + "%";',
'}',
'function setSubsubPercent(projId, subId, subsubId, val){',
'  var p = DATA.find(function(x){return x.id===projId;});',
'  var s = p.subs.find(function(x){return x.id===subId;});',
'  var ss = s.subsubs.find(function(x){return x.id===subsubId;});',
'  ss.percent = parseInt(val,10);',
'  render(); sync(true);',
'}',
'function renameProject(projId){',
'  var p = DATA.find(function(x){return x.id===projId;});',
'  var name = prompt("Nouveau nom du projet :", p.name);',
'  if(name===null) return;',
'  name = name.trim();',
'  if(!name) return;',
'  p.name = name;',
'  render(); sync();',
'}',
'function renameSub(projId, subId){',
'  var p = DATA.find(function(x){return x.id===projId;});',
'  var s = p.subs.find(function(x){return x.id===subId;});',
'  var name = prompt("Nouveau nom de la sous-catégorie :", s.name);',
'  if(name===null) return;',
'  name = name.trim();',
'  if(!name) return;',
'  s.name = name;',
'  render(); sync();',
'}',
'function renameSubsub(projId, subId, subsubId){',
'  var p = DATA.find(function(x){return x.id===projId;});',
'  var s = p.subs.find(function(x){return x.id===subId;});',
'  var ss = s.subsubs.find(function(x){return x.id===subsubId;});',
'  var name = prompt("Nouveau nom de la sous-sous-catégorie :", ss.name);',
'  if(name===null) return;',
'  name = name.trim();',
'  if(!name) return;',
'  ss.name = name;',
'  render(); sync();',
'}',
'',
'function statusOptions(current){',
'  var opts = [["not_started","⚪ Pas commencé"],["in_progress","🔵 En cours"],["done","✅ Terminé"],["transferred","🔁 Transféré équipe"]];',
'  return opts.map(function(o){ return "<option value=\\""+o[0]+"\\""+(o[0]===current?" selected":"")+">"+o[1]+"</option>"; }).join("");',
'}',
'',
'function render(){',
'  document.getElementById("score-bar").innerHTML =',
'    "<div><div class=\\"score-num\\">"+globalPct()+"%</div><div class=\\"score-label\\">accompli</div></div>" +',
'    "<div><div class=\\"score-num\\" style=\\"color:var(--white)\\">"+globalXp()+"</div><div class=\\"score-label\\">XP total</div></div>";',
'',
'  var out = [];',
'  MONTHS.forEach(function(m){',
'    var projs = projectsForMonth(m.id);',
'    var seasonColor = SEASONS[m.season].color;',
'    var collapsed = !!collapsedMonths[m.id];',
'    out.push("<section class=\\"month\\" ondragover=\\"onMonthDragOver(event)\\" ondragleave=\\"onMonthDragLeave(event)\\" ondrop=\\"onMonthDrop(event,"+m.id+")\\">");',
'    out.push("<div class=\\"month-title\\" onclick=\\"toggleMonth("+m.id+")\\"><span class=\\"month-arrow"+(collapsed?" collapsed":"")+"\\">▾</span><span class=\\"mdot\\" style=\\"background:"+seasonColor+"\\"></span>"+m.emoji+" "+m.name+"<span class=\\"mstat\\">"+monthPct(m.id)+"%</span></div>");',
'    out.push("<div class=\\"month-body"+(collapsed?" collapsed":"")+"\\">");',
'    projs.forEach(function(p){',
'      out.push("<div class=\\"project\\" draggable=\\"true\\" ondragstart=\\"onProjectDragStart(event,\'"+p.id+"\')\\" ondragend=\\"onProjectDragEnd(event)\\">");',
'      out.push("<div class=\\"project-head\\"><span class=\\"drag-handle\\" title=\\"Glisser pour changer de mois\\">⠿</span><span class=\\"pdot\\" style=\\"background:"+p.color+"\\"></span><span class=\\"project-title\\">"+p.name+"</span><button class=\\"rename-btn\\" onclick=\\"renameProject(\'"+p.id+"\')\\" title=\\"Renommer\\">✎</button><span class=\\"project-pct\\">"+projectPct(p)+"%</span><button class=\\"archive-btn\\" onclick=\\"archiveProject(\'"+p.id+"\')\\" title=\\"Archiver ce projet (retiré de la to-do et de la découverte des îles, gardé en historique)\\">📦</button><button class=\\"del-btn\\" onclick=\\"deleteProject(\'"+p.id+"\')\\" title=\\"Supprimer le projet\\">✕</button></div>");',
'      p.subs.forEach(function(s, subIdx){',
'        var pct = subPercent(s);',
'        var hasChildren = s.subsubs && s.subsubs.length>0;',
'        var color = hasChildren ? pctColorAgg(pct) : STATUS_META[s.status].color;',
'        out.push("<div class=\\"subcat-row\\">");',
'        out.push("<div class=\\"subcat-top\\"><div class=\\"subcat-name\\">"+s.name+"</div><div class=\\"subcat-date\\">"+s.date+"</div><div class=\\"subcat-pct\\" style=\\"background:"+color+"22;color:"+color+"\\">"+pct+"%</div><button class=\\"move-btn\\" onclick=\\"moveSub(\'"+p.id+"\',\'"+s.id+"\',-1)\\" title=\\"Monter\\""+(subIdx===0?" disabled":"")+">▲</button><button class=\\"move-btn\\" onclick=\\"moveSub(\'"+p.id+"\',\'"+s.id+"\',1)\\" title=\\"Descendre\\""+(subIdx===p.subs.length-1?" disabled":"")+">▼</button><button class=\\"rename-btn\\" onclick=\\"renameSub(\'"+p.id+"\',\'"+s.id+"\')\\" title=\\"Renommer\\">✎</button><button class=\\"del-btn\\" onclick=\\"deleteSub(\'"+p.id+"\',\'"+s.id+"\')\\" title=\\"Supprimer\\">✕</button></div>");',
'        if(hasChildren){',
'          out.push("<div class=\\"subsubs-wrap\\">");',
'          s.subsubs.forEach(function(ss){',
'            var ssPct = leafPercent(ss);',
'            var ssColor = STATUS_META[ss.status].color;',
'            out.push("<div class=\\"subsubcat-row\\">");',
'            out.push("<div class=\\"subsubcat-top\\"><div class=\\"subsubcat-name\\">"+ss.name+"</div><div class=\\"subcat-date\\">"+ss.date+"</div><div class=\\"subcat-pct\\" style=\\"background:"+ssColor+"22;color:"+ssColor+"\\">"+ssPct+"%</div><button class=\\"rename-btn\\" onclick=\\"renameSubsub(\'"+p.id+"\',\'"+s.id+"\',\'"+ss.id+"\')\\" title=\\"Renommer\\">✎</button><button class=\\"del-btn\\" onclick=\\"deleteSubsub(\'"+p.id+"\',\'"+s.id+"\',\'"+ss.id+"\')\\" title=\\"Supprimer\\">✕</button></div>");',
'            out.push("<div class=\\"subcat-controls\\">");',
'            out.push("<select class=\\"status-select\\" onchange=\\"setSubsubStatus(\'"+p.id+"\',\'"+s.id+"\',\'"+ss.id+"\',this.value)\\">"+statusOptions(ss.status)+"</select>");',
'            if(ss.status==="in_progress"){',
'              var ssv = ss.percent===undefined?50:ss.percent;',
'              out.push("<input type=\\"range\\" class=\\"percent-range\\" min=\\"0\\" max=\\"100\\" step=\\"5\\" value=\\""+ssv+"\\" oninput=\\"setSubsubPercentLive(\'"+ss.id+"\',this.value)\\" onchange=\\"setSubsubPercent(\'"+p.id+"\',\'"+s.id+"\',\'"+ss.id+"\',this.value)\\">");',
'              out.push("<span class=\\"percent-live mono\\" id=\\"live-ss-"+ss.id+"\\">"+ssv+"%</span>");',
'            }',
'            out.push("</div>");',
'            out.push("</div>");',
'          });',
'          out.push("</div>");',
'        } else {',
'          out.push("<div class=\\"subcat-controls\\">");',
'          out.push("<select class=\\"status-select\\" onchange=\\"setStatus(\'"+p.id+"\',\'"+s.id+"\',this.value)\\">"+statusOptions(s.status)+"</select>");',
'          if(s.status==="in_progress"){',
'            var pv = s.percent===undefined?50:s.percent;',
'            out.push("<input type=\\"range\\" class=\\"percent-range\\" min=\\"0\\" max=\\"100\\" step=\\"5\\" value=\\""+pv+"\\" oninput=\\"setPercentLive(\'"+s.id+"\',this.value)\\" onchange=\\"setPercent(\'"+p.id+"\',\'"+s.id+"\',this.value)\\">");',
'            out.push("<span class=\\"percent-live mono\\" id=\\"live-"+s.id+"\\">"+pv+"%</span>");',
'          }',
'          out.push("</div>");',
'        }',
'        out.push("<div class=\\"add-row subsub-add-row\\">");',
'        out.push("<button class=\\"add-link\\" onclick=\\"toggleForm(\'subsubform-"+s.id+"\')\\">+ Ajouter une sous-sous-catégorie</button>");',
'        out.push("<div class=\\"add-form\\" id=\\"subsubform-"+s.id+"\\">");',
'        out.push("<input class=\\"name\\" id=\\"newsubsub-name-"+s.id+"\\" placeholder=\\"Nom de la sous-sous-catégorie\\">");',
'        out.push("<input class=\\"date\\" id=\\"newsubsub-date-"+s.id+"\\" placeholder=\\"ex: 15 sept.\\">");',
'        out.push("<button onclick=\\"addSubsub(\'"+p.id+"\',\'"+s.id+"\')\\">Ajouter</button>");',
'        out.push("</div></div>");',
'        var comments = s.comments || [];',
'        out.push("<div class=\\"comment-toggle\\" onclick=\\"toggleComments(\'"+s.id+"\')\\">💬 "+comments.length+(comments.length>1?" commentaires":" commentaire")+"</div>");',
'        out.push("<div class=\\"comments-panel"+(openComments[s.id]?" open":"")+"\\" id=\\"comments-"+s.id+"\\">");',
'        comments.forEach(function(c, idx){',
'          out.push("<div class=\\"comment-item\\"><div class=\\"comment-text\\">"+c.text+"</div><div class=\\"comment-meta\\"><span>"+c.date+"</span><button class=\\"comment-del\\" onclick=\\"deleteComment(\'"+p.id+"\',\'"+s.id+"\',"+idx+")\\">✕</button></div></div>");',
'        });',
'        out.push("<div class=\\"comment-add-row\\"><input class=\\"comment-input\\" id=\\"comment-input-"+s.id+"\\" placeholder=\\"Ajouter un commentaire…\\" onkeydown=\\"commentKeydown(event,\'"+p.id+"\',\'"+s.id+"\')\\"><button onclick=\\"addComment(\'"+p.id+"\',\'"+s.id+"\')\\">Envoyer</button></div>");',
'        out.push("</div>");',
'        out.push("</div>");',
'      });',
'      out.push("<div class=\\"add-row\\">");',
'      out.push("<button class=\\"add-link\\" onclick=\\"toggleForm(\'subform-"+p.id+"\')\\">+ Ajouter une sous-catégorie</button>");',
'      out.push("<div class=\\"add-form\\" id=\\"subform-"+p.id+"\\">");',
'      out.push("<input class=\\"name\\" id=\\"newsub-name-"+p.id+"\\" placeholder=\\"Nom de la sous-catégorie\\">");',
'      out.push("<input class=\\"date\\" id=\\"newsub-date-"+p.id+"\\" placeholder=\\"ex: 15 sept.\\">");',
'      out.push("<button onclick=\\"addSub(\'"+p.id+"\')\\">Ajouter</button>");',
'      out.push("</div></div>");',
'      out.push("</div>");',
'    });',
'    out.push("<div class=\\"add-row month-add\\">");',
'    out.push("<button class=\\"add-link\\" onclick=\\"toggleForm(\'projform-"+m.id+"\')\\">+ Ajouter un projet</button>");',
'    out.push("<div class=\\"add-form\\" id=\\"projform-"+m.id+"\\">");',
'    out.push("<input class=\\"name\\" id=\\"newproj-"+m.id+"\\" placeholder=\\"Nom du projet\\">");',
'    out.push("<button onclick=\\"addProject("+m.id+")\\">Ajouter</button>");',
'    out.push("</div></div>");',
'    out.push("</div>");',
'    out.push("</section>");',
'  });',
'  document.getElementById("months-container").innerHTML = out.join("");',
'',
'  var archived = archivedProjects();',
'  var outA = [];',
'  outA.push("<section class=\\"archived-section\\">");',
'  outA.push("<div class=\\"archived-title\\" onclick=\\"toggleArchivedSection()\\"><span class=\\"month-arrow"+(archivedCollapsed?" collapsed":"")+"\\">▾</span>🗄️ Projets archivés (historique)<span class=\\"mstat\\">"+archived.length+"</span></div>");',
'  outA.push("<div class=\\"archived-body"+(archivedCollapsed?" collapsed":"")+"\\">");',
'  if(archived.length===0){',
'    outA.push("<p style=\\"color:var(--muted); font-size:12.5px;\\">Aucun projet archivé pour le moment.</p>");',
'  }',
'  archived.forEach(function(p){',
'    var monthName = MONTHS[p.month] ? MONTHS[p.month].name : "?";',
'    outA.push("<div class=\\"project archived-project\\">");',
'    outA.push("<div class=\\"project-head\\"><span class=\\"pdot\\" style=\\"background:"+p.color+"\\"></span><span class=\\"archived-month-tag\\">"+monthName+"</span><span class=\\"project-title\\">"+p.name+"</span><span class=\\"project-pct\\">"+projectPct(p)+"%</span><button class=\\"unarchive-btn\\" onclick=\\"unarchiveProject(\'"+p.id+"\')\\" title=\\"Remettre ce projet dans la to-do active\\">♻️ Désarchiver</button><button class=\\"del-btn\\" onclick=\\"deleteProject(\'"+p.id+"\')\\" title=\\"Supprimer définitivement\\">✕</button></div>");',
'    p.subs.forEach(function(s){',
'      var pct = subPercent(s);',
'      var hasChildren = s.subsubs && s.subsubs.length>0;',
'      var color = hasChildren ? pctColorAgg(pct) : STATUS_META[s.status].color;',
'      outA.push("<div class=\\"subcat-row\\"><div class=\\"subcat-top\\"><div class=\\"subcat-name\\">"+s.name+"</div><div class=\\"subcat-date\\">"+s.date+"</div><div class=\\"subcat-pct\\" style=\\"background:"+color+"22;color:"+color+"\\">"+pct+"%</div></div></div>");',
'    });',
'    outA.push("</div>");',
'  });',
'  outA.push("</div>");',
'  outA.push("</section>");',
'  document.getElementById("archived-container").innerHTML = outA.join("");',
'}',
'render();',
'<' + '/script>',
'</body></html>'
  ].join('\n');

  openFullTodoOverlay(html);
}

/* Ouvre la page de travail "to-do complète" en plein écran, directement dans un iframe isolé sur la même page */
function openFullTodoOverlay(html){
  let overlay = document.getElementById('fulltodo-overlay');
  if(overlay){ overlay.querySelector('iframe').srcdoc = html; overlay.style.display='block'; return; }
  overlay = document.createElement('div');
  overlay.id = 'fulltodo-overlay';
  overlay.style.cssText = 'position:fixed; inset:0; z-index:200; background:#0b0f1f;';
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕ Fermer et revenir à la carte';
  closeBtn.style.cssText = 'position:absolute; top:14px; right:14px; z-index:210; background:rgba(255,255,255,0.1); color:#eef3fb; border:1px solid rgba(255,255,255,0.25); border-radius:20px; padding:9px 16px; font-family:sans-serif; font-size:12.5px; font-weight:700; cursor:pointer;';
  closeBtn.onclick = ()=>{ overlay.style.display='none'; };
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'width:100%; height:100%; border:none;';
  iframe.srcdoc = html;
  overlay.appendChild(closeBtn);
  overlay.appendChild(iframe);
  document.body.appendChild(overlay);
}

/* ============ SYNCHRO AVEC L'ONGLET "TO-DO COMPLÈTE" ============ */
window.addEventListener('message', function(e){
  if(e.data && e.data.type==='archipel-sync' && Array.isArray(e.data.projects)){
    PROJECTS = e.data.projects;
    if(e.data.markActive) markWeekActive();
    refreshAll();
    checkBadges();
    showToast('🔄', "To-do mise à jour depuis l'autre onglet");
    scheduleSave(getAppStateSnapshot);
  }
});

/* ============ PERSISTANCE (Supabase) ============ */
function getAppStateSnapshot(){
  return { projects: PROJECTS, notes: notesContent, unlockedAnimals: Array.from(unlockedAnimals), activityWeeks: Array.from(activityWeeks) };
}

/* ============ COMPTE (lien magique par e-mail) ============ */
// Objectif : par défaut chaque navigateur a sa propre session anonyme (donc sa propre
// to-do, isolée par origine — localhost ≠ vercel.app). Relier un e-mail permet de
// retrouver la même to-do partout où on se reconnecte avec ce même e-mail.
async function renderAccountWidget(){
  const el = document.getElementById('account-widget');
  if(!el || !supabaseReady) { if(el) el.innerHTML=''; return; }
  const { data:{ user } } = await supabaseClient.auth.getUser();
  const isReal = !!(user && !user.is_anonymous && user.email);

  if(isReal){
    el.innerHTML = `
      <button class="account-btn" id="account-btn">✅ ${user.email}</button>
      <div class="account-dropdown" id="account-dropdown">
        <p>Connecté(e) avec cet e-mail : ta to-do est la même sur tous les navigateurs et appareils où tu te reconnectes avec cette adresse.</p>
        <button class="secondary" id="account-signout-btn">Se déconnecter</button>
      </div>
    `;
    document.getElementById('account-signout-btn').addEventListener('click', async ()=>{
      await signOutAccount();
      location.reload();
    });
  } else {
    el.innerHTML = `
      <button class="account-btn" id="account-btn">👤 Invité</button>
      <div class="account-dropdown" id="account-dropdown">
        <p><strong>Ta to-do n'est visible que sur ce navigateur.</strong> Relie un e-mail pour la retrouver ailleurs.</p>
        <input type="email" id="account-email-input" placeholder="ton@email.fr" autocomplete="email">
        <button id="account-link-btn">1ère fois : créer mon compte ici</button>
        <button class="secondary" id="account-signin-btn">J'ai déjà un compte : m'y connecter</button>
        <div class="account-msg" id="account-msg"></div>
      </div>
    `;
    document.getElementById('account-link-btn').addEventListener('click', ()=>handleAccountAction('link'));
    document.getElementById('account-signin-btn').addEventListener('click', ()=>handleAccountAction('signin'));
  }
  document.getElementById('account-btn').addEventListener('click', (e)=>{
    e.stopPropagation();
    document.getElementById('account-dropdown').classList.toggle('open');
  });
}
document.addEventListener('click', (e)=>{
  const dropdown = document.getElementById('account-dropdown');
  const widget = document.getElementById('account-widget');
  if(dropdown && dropdown.classList.contains('open') && widget && !widget.contains(e.target)){
    dropdown.classList.remove('open');
  }
});
async function handleAccountAction(kind){
  const input = document.getElementById('account-email-input');
  const msg = document.getElementById('account-msg');
  const email = input.value.trim();
  if(!email){ msg.textContent = 'Entre un e-mail.'; return; }
  msg.textContent = 'Envoi en cours…';
  const { error } = kind==='link' ? await linkEmailToCurrentAccount(email) : await signInWithEmail(email);
  msg.textContent = error ? ('Erreur : '+error.message) : '📩 Vérifie ta boîte mail et clique le lien pour finaliser.';
}

/* ============ BLOC-NOTES ============ */
let notesContent = '';
let notesSaveTimer = null;
const notesTextarea = document.getElementById('notes-textarea');
const notesIndicator = document.getElementById('notes-saved-indicator');
notesTextarea.value = notesContent;
notesTextarea.addEventListener('input', (e)=>{
  notesContent = e.target.value;
  notesIndicator.textContent = 'Frappe en cours…';
  clearTimeout(notesSaveTimer);
  notesSaveTimer = setTimeout(()=>{
    notesIndicator.textContent = 'Sauvegardé ✓';
  }, 600);
  scheduleSave(getAppStateSnapshot);
});

/* ============ INIT ============ */
async function initApp(){
  await initSupabase();
  const saved = await loadState();
  if(saved){
    if(Array.isArray(saved.projects)) PROJECTS = saved.projects;
    if(typeof saved.notes === 'string'){
      notesContent = saved.notes;
      notesTextarea.value = notesContent;
    }
    if(Array.isArray(saved.unlockedAnimals)){
      unlockedAnimals = new Set(saved.unlockedAnimals);
    }
    if(Array.isArray(saved.activityWeeks)){
      activityWeeks = new Set(saved.activityWeeks);
    }
  } else if(supabaseReady){
    // Première connexion sur ce navigateur : rien à charger depuis Supabase, mais on
    // pousse tout de suite la to-do actuelle (celle affichée à l'écran) au lieu d'attendre
    // qu'une modification déclenche la première sauvegarde.
    await saveState(getAppStateSnapshot());
  }
  renderAccountWidget();
  buildMap();
  checkBadges();
  renderActivityBar();
}
initApp();
