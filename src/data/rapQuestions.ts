import resultJayzHardknock from '@/assets/result-jayz-hardknock.jpg';
import resultNasRuled from '@/assets/result-nas-ruled.jpg';
import resultYmcmb from '@/assets/result-ymcmb.jpg';
import resultDmx from '@/assets/result-dmx.jpg';

export interface Question {
  id: string;
  category: string;
  question: string;
  hint: string;
  options: string[];
  correctAnswer: string;
  resultTitle: string;
  resultCommentary: string;
  resultImageUrl?: string;
}

export const rapQuestions: Question[] = [
  // Questions from reference - these go first!
  {
    id: "rap-ref-1",
    category: "rap",
    question: "Who rapped It's A Hardknock Life?",
    hint: "Orphan Annie was definitely in the Ghetto tho...",
    options: ["Biggie", "Nas", "Jay-Z", "Lil Wayne"],
    correctAnswer: "Jay-Z",
    resultTitle: "Jay-Z Duh! JIGGA took off with this one!",
    resultCommentary: "My Auntie Tots loved him, so I used to pull up bumping Ether!",
    resultImageUrl: resultJayzHardknock
  },
  {
    id: "rap-ref-2",
    category: "rap",
    question: "If I Ruled the World, Who would I Free?",
    hint: "Nas and Lauryn Hill - 2 Goats, 1 Track.",
    options: ["All My Sons", "All The Scrubs", "Hoodrats and Hoochies", "Cash from the Bank"],
    correctAnswer: "All My Sons",
    resultTitle: "Correct! All My Sons",
    resultCommentary: "\"I Love 'em Love 'em Baby!\" Nas and Lauryn made magic on this one!",
    resultImageUrl: resultNasRuled
  },
  {
    id: "rap-ref-3",
    category: "rap",
    question: "Who was NEVER a part of YMCMB?",
    hint: "That's Young Money Cash Money Billionaires Baby! -Lil Wayne's Legacy-A Living Legend!",
    options: ["Tyga", "Nicki Minaj", "Shanell", "Drake", "Black Chyna"],
    correctAnswer: "Black Chyna",
    resultTitle: "CORRECT! I Ain't Think You Was Gonna Get It.",
    resultCommentary: "Blac Chyna was in the videos, but Shanell was in the group...",
    resultImageUrl: resultYmcmb
  },
  {
    id: "rap-ref-4",
    category: "rap",
    question: "What's DMX's Real Name and Where's He From?",
    hint: "My Favorite DMX songs are Get At Me Dog, Damien, 24hrs to Live, Slippin, and Track 19 on It's Dark and Hell is Hot.",
    options: ["Earl Simmons, Yonkers", "Damien Xavier, Brooklyn", "Clifford Smith, Staten Island", "Kasseem, The Bronx"],
    correctAnswer: "Earl Simmons, Yonkers",
    resultTitle: "The Dark Man X was born Earl Simmons December 18, 1970 (Sagittarius)",
    resultCommentary: "Earl Simmons could be found speeding through Yonkers at the top of his fame! RIP to a legend!",
    resultImageUrl: resultDmx
  },
  // Original questions continue
  {
    id: "rap-1",
    category: "rap",
    question: "What is Jay-Z's real name?",
    hint: "This Brooklyn legend went from Marcy Projects to the Roc",
    options: ["Shawn Carter", "Sean Combs", "Calvin Broadus", "Andre Young"],
    correctAnswer: "Shawn Carter",
    resultTitle: "JAY-Z! DUH!",
    resultCommentary: "JIGGA took off with this one! From Marcy to the top, Shawn Corey Carter built an empire. HOV knows!"
  },
  {
    id: "rap-2",
    category: "rap",
    question: "Which rapper founded Death Row Records?",
    hint: "This West Coast legend was all about that gangsta lifestyle",
    options: ["Dr. Dre", "Suge Knight", "Snoop Dogg", "Ice Cube"],
    correctAnswer: "Suge Knight",
    resultTitle: "DEATH ROW!",
    resultCommentary: "Suge Knight built the Row and put the West Coast on the map. That red suit at the Source Awards? Legendary."
  },
  {
    id: "rap-3",
    category: "rap",
    question: "What year did Tupac release 'All Eyez on Me'?",
    hint: "This double album dropped the same year as his beef with Biggie peaked",
    options: ["1994", "1995", "1996", "1997"],
    correctAnswer: "1996",
    resultTitle: "THUG LIFE!",
    resultCommentary: "February 13, 1996 - Pac dropped a double album classic. All Eyez on Me went 10x platinum. The GOAT did that!"
  },
  {
    id: "rap-4",
    category: "rap",
    question: "Which NYC borough is The Notorious B.I.G. from?",
    hint: "Ready to Die was cooked up in these streets",
    options: ["Queens", "Brooklyn", "Bronx", "Harlem"],
    correctAnswer: "Brooklyn",
    resultTitle: "BROOKLYN'S FINEST!",
    resultCommentary: "Bedford-Stuyvesant raised the greatest storyteller in hip-hop. It was all a dream, and Brooklyn made it happen!"
  },
  {
    id: "rap-5",
    category: "rap",
    question: "What was Eminem's first major label album?",
    hint: "Slim Shady introduced himself to the world with this one",
    options: ["The Eminem Show", "The Slim Shady LP", "Infinite", "The Marshall Mathers LP"],
    correctAnswer: "The Slim Shady LP",
    resultTitle: "SLIM SHADY!",
    resultCommentary: "1999 - Shady dropped on Aftermath and the rap game was NEVER the same. Will the real Slim Shady please stand up?"
  },
  {
    id: "rap-6",
    category: "rap",
    question: "Which rapper's real name is Aubrey Drake Graham?",
    hint: "Started from the bottom, now he's everywhere",
    options: ["The Weeknd", "Drake", "Travis Scott", "Post Malone"],
    correctAnswer: "Drake",
    resultTitle: "OVO SOUND!",
    resultCommentary: "Aubrey went from Degrassi to running the game. The 6 God stays winning, and you know what time it is!"
  },
  {
    id: "rap-7",
    category: "rap",
    question: "What record label did Kanye West start?",
    hint: "Good music vibes only at this label",
    options: ["Roc-A-Fella", "GOOD Music", "Def Jam", "Cash Money"],
    correctAnswer: "GOOD Music",
    resultTitle: "GOOD VIBES!",
    resultCommentary: "Getting Out Our Dreams Music! Ye put on Pusha T, Big Sean, and more. That's how you build a dynasty!"
  },
  {
    id: "rap-8",
    category: "rap",
    question: "Which rapper is known as 'Weezy F Baby'?",
    hint: "Young Moolah Baby! Best rapper alive claims",
    options: ["Birdman", "Lil Wayne", "Juvenile", "Mannie Fresh"],
    correctAnswer: "Lil Wayne",
    resultTitle: "WEEZY BABY!",
    resultCommentary: "And the F is for phenomenal! Dwayne Michael Carter Jr. dropped more classics than most rappers drop mixtapes!"
  },
  {
    id: "rap-9",
    category: "rap",
    question: "What group was Andre 3000 part of?",
    hint: "ATLiens know the answer to this one",
    options: ["Goodie Mob", "OutKast", "Dungeon Family", "The Roots"],
    correctAnswer: "OutKast",
    resultTitle: "ATL FOREVER!",
    resultCommentary: "Three Stacks and Big Boi changed the South! The South got something to say, and OutKast made sure the world heard it!"
  },
  {
    id: "rap-10",
    category: "rap",
    question: "Which rapper wore a clock necklace as his signature accessory?",
    hint: "Public Enemy's hype man knew what time it was",
    options: ["Flavor Flav", "Chuck D", "LL Cool J", "Slick Rick"],
    correctAnswer: "Flavor Flav",
    resultTitle: "YEAH BOI!",
    resultCommentary: "Flavor Flav knew the time! That clock was iconic - Public Enemy's hype man changed the game forever!"
  },
  {
    id: "rap-11",
    category: "rap",
    question: "What is Snoop Dogg's original stage name?",
    hint: "Before the Dogg, there was...",
    options: ["Snoop Lion", "Snoop Doggy Dogg", "Big Snoop", "Tha Doggfather"],
    correctAnswer: "Snoop Doggy Dogg",
    resultTitle: "BOW WOW WOW!",
    resultCommentary: "Snoop Doggy Dogg in the place to be! Calvin Cordozar Broadus Jr. came up with Dre and never looked back!"
  },
  {
    id: "rap-12",
    category: "rap",
    question: "Which rapper founded Aftermath Entertainment?",
    hint: "This producer-rapper duo with Beats by Dre",
    options: ["Eminem", "50 Cent", "Dr. Dre", "Ice Cube"],
    correctAnswer: "Dr. Dre",
    resultTitle: "THE DOC!",
    resultCommentary: "Andre Young built Aftermath after leaving Death Row. Signed Em, 50, Kendrick - Dre stays finding the hits!"
  },
  {
    id: "rap-13",
    category: "rap",
    question: "What city is Kendrick Lamar from?",
    hint: "K-Dot repped this city on every album",
    options: ["Oakland", "Compton", "Long Beach", "Inglewood"],
    correctAnswer: "Compton",
    resultTitle: "COMPTON'S KING!",
    resultCommentary: "Kendrick Lamar Duckworth put Compton back on the map! From Section.80 to Mr. Morale, he never forgot where he came from!"
  },
  {
    id: "rap-14",
    category: "rap",
    question: "Which album featured the hit 'In Da Club'?",
    hint: "50 Cent's debut went crazy",
    options: ["The Massacre", "Get Rich or Die Tryin'", "Curtis", "Before I Self Destruct"],
    correctAnswer: "Get Rich or Die Tryin'",
    resultTitle: "G-UNIT!",
    resultCommentary: "2003 - Fifty dropped and everyone was in the club! That album sold 872,000 copies in the first week. G-G-G-G-UNIT!"
  },
  {
    id: "rap-15",
    category: "rap",
    question: "What rap group featured Phife Dawg and Q-Tip?",
    hint: "Can I kick it? Yes you can!",
    options: ["De La Soul", "A Tribe Called Quest", "The Jungle Brothers", "Black Sheep"],
    correctAnswer: "A Tribe Called Quest",
    resultTitle: "TRIBE VIBES!",
    resultCommentary: "The Low End Theory changed hip-hop forever! Phife Dawg and Q-Tip made jazz rap a movement. RIP Phife!"
  },
  {
    id: "rap-16",
    category: "rap",
    question: "Which rapper has a tattoo of Africa on his face?",
    hint: "This NY rapper went from beef to being respected by everyone",
    options: ["Gucci Mane", "Lil Uzi Vert", "21 Savage", "The Game"],
    correctAnswer: "Gucci Mane",
    resultTitle: "GUWOP!",
    resultCommentary: "Big Guwop came back from prison a whole new man! That ice cream tattoo and Africa face tat are legendary. Burr!"
  },
  {
    id: "rap-17",
    category: "rap",
    question: "What was the name of Wu-Tang Clan's debut album?",
    hint: "36 of something... protect ya neck!",
    options: ["Wu-Tang Forever", "Enter the Wu-Tang (36 Chambers)", "Iron Flag", "The W"],
    correctAnswer: "Enter the Wu-Tang (36 Chambers)",
    resultTitle: "WU-TANG!",
    resultCommentary: "1993 - Staten Island's finest brought that raw hip-hop! C.R.E.A.M. still hits different. Wu-Tang is for the children!"
  },
  {
    id: "rap-18",
    category: "rap",
    question: "Which rapper collaborated with Nicki Minaj on 'Monster'?",
    hint: "My Beautiful Dark Twisted Fantasy vibes",
    options: ["Jay-Z", "Rick Ross", "Kanye West", "Pusha T"],
    correctAnswer: "Kanye West",
    resultTitle: "YE SEASON!",
    resultCommentary: "That Monster verse? Nicki ate EVERYONE up on Ye's album. But Kanye brought them all together - genius moves only!"
  },
  {
    id: "rap-19",
    category: "rap",
    question: "What's the name of Megan Thee Stallion's viral dance?",
    hint: "Get low, get low... Houston Hottie style",
    options: ["The Renegade", "The Hot Girl Walk", "The Savage", "The Woah"],
    correctAnswer: "The Savage",
    resultTitle: "HOT GIRL!",
    resultCommentary: "Megan Thee Stallion had everyone doing the Savage challenge! TikTok went crazy, and the Hotties showed up!"
  },
  {
    id: "rap-20",
    category: "rap",
    question: "Which rapper's album is titled 'The Life of Pablo'?",
    hint: "This album was updated multiple times after release",
    options: ["Kanye West", "J. Cole", "Drake", "Future"],
    correctAnswer: "Kanye West",
    resultTitle: "PABLO!",
    resultCommentary: "Which Pablo? Picasso? Escobar? The Apostle? Ye had us questioning everything! That album rollout was wild!"
  },
  {
    id: "rap-21",
    category: "rap",
    question: "What's Cardi B's real first name?",
    hint: "This Bronx rapper went from stripper to superstar",
    options: ["Belcalis", "Destiny", "Onika", "Amala"],
    correctAnswer: "Belcalis",
    resultTitle: "OKURRR!",
    resultCommentary: "Belcalis Marlenis Almánzar - say that five times fast! From the Bronx to the Grammys, Cardi B did that!"
  },
  {
    id: "rap-22",
    category: "rap",
    question: "Which legendary DJ was part of Run-DMC?",
    hint: "King of rock, there is none higher",
    options: ["DJ Premier", "Jam Master Jay", "Grandmaster Flash", "DJ Jazzy Jeff"],
    correctAnswer: "Jam Master Jay",
    resultTitle: "JMJ FOREVER!",
    resultCommentary: "Jason Mizell, aka Jam Master Jay - the backbone of Run-DMC! His legacy lives on forever. RIP to a legend!"
  },
  {
    id: "rap-23",
    category: "rap",
    question: "What crew is Travis Scott associated with?",
    hint: "It's lit! Ragers know",
    options: ["OVO", "Cactus Jack", "TDE", "QC"],
    correctAnswer: "Cactus Jack",
    resultTitle: "IT'S LIT!",
    resultCommentary: "Jacques Webster built Cactus Jack and brought the ragers! From Houston to the world, La Flame keeps winning!"
  },
  {
    id: "rap-24",
    category: "rap",
    question: "Which rapper is known for 'Migos Flow'?",
    hint: "Versace, Versace, Versace...",
    options: ["Future", "Migos", "Gucci Mane", "Young Thug"],
    correctAnswer: "Migos",
    resultTitle: "DAB!",
    resultCommentary: "Quavo, Offset, and Takeoff created the flow that EVERYONE bit! Atlanta's finest changed the triplet game forever!"
  },
  {
    id: "rap-25",
    category: "rap",
    question: "What's the name of Nas's debut album?",
    hint: "Queensbridge dropped a classic in '94",
    options: ["Illmatic", "It Was Written", "Stillmatic", "God's Son"],
    correctAnswer: "Illmatic",
    resultTitle: "QUEENSBRIDGE!",
    resultCommentary: "Illmatic is the hip-hop Bible! Nas was 20 years old dropping bars that still hit today. Escobar season forever!"
  },
  {
    id: "rap-26",
    category: "rap",
    question: "Which rapper is the CEO of Quality Control Music?",
    hint: "He signed Migos and Lil Baby",
    options: ["Pierre 'P' Thomas", "Coach K", "Kevin 'Coach K' Lee", "Pee"],
    correctAnswer: "Pierre 'P' Thomas",
    resultTitle: "QC THE LABEL!",
    resultCommentary: "P and Coach K built Quality Control into a powerhouse! Migos, Lil Baby, City Girls - they got the hits!"
  },
  {
    id: "rap-27",
    category: "rap",
    question: "What is J. Cole's hometown?",
    hint: "Raised in the ville, born in Germany",
    options: ["Atlanta", "Fayetteville", "Raleigh", "Charlotte"],
    correctAnswer: "Fayetteville",
    resultTitle: "DREAMVILLE!",
    resultCommentary: "Jermaine Lamar Cole put Fayetteville on the map! Forest Hills Drive is forever home. No features needed!"
  },
  {
    id: "rap-28",
    category: "rap",
    question: "Which rapper created the 'Harlem Shake'?",
    hint: "Not the viral meme - the original dance!",
    options: ["Diddy", "Ma$e", "Cam'ron", "Baauer"],
    correctAnswer: "Baauer",
    resultTitle: "HARLEM!",
    resultCommentary: "Baauer made that beat, but the real Harlem Shake goes way back! Dipset had the streets doing that dance first!"
  },
  {
    id: "rap-29",
    category: "rap",
    question: "What label did Tupac sign to before Death Row?",
    hint: "Digital Underground vibes",
    options: ["Interscope", "Jive", "Atlantic", "Priority"],
    correctAnswer: "Interscope",
    resultTitle: "THUG LIFE!",
    resultCommentary: "Pac signed with Interscope for 2Pacalypse Now! Before the Row, he was building his legacy one album at a time!"
  },
  {
    id: "rap-30",
    category: "rap",
    question: "Which female rapper had a hit called 'Bodak Yellow'?",
    hint: "These expensive, these is red bottoms",
    options: ["Nicki Minaj", "Cardi B", "Megan Thee Stallion", "Doja Cat"],
    correctAnswer: "Cardi B",
    resultTitle: "BLOODY SHOES!",
    resultCommentary: "Cardi B made bloody moves in 2017! First female rapper to top Billboard solo since Lauryn Hill. That's history!"
  },
  {
    id: "rap-31",
    category: "rap",
    question: "What record label is Nipsey Hussle known for founding?",
    hint: "The Marathon continues...",
    options: ["Top Dawg", "All Money In", "Interscope", "Atlantic"],
    correctAnswer: "All Money In",
    resultTitle: "THE MARATHON!",
    resultCommentary: "Ermias Asghedom built All Money In from nothing! Nipsey showed the world what independence really means. TMC!"
  },
  {
    id: "rap-32",
    category: "rap",
    question: "Which rapper's real name is Nayvadius Wilburn?",
    hint: "Dirty Sprite and codeine vibes",
    options: ["Young Thug", "Future", "Lil Baby", "Gunna"],
    correctAnswer: "Future",
    resultTitle: "FUTURE HENDRIX!",
    resultCommentary: "Nayvadius brought that Atlanta wave! From Freebandz to running the trap game, Future stays in his bag!"
  },
  {
    id: "rap-33",
    category: "rap",
    question: "What duo is known for the album 'Watch The Throne'?",
    hint: "N****s in Paris went crazy",
    options: ["Kanye & Drake", "Jay-Z & Kanye West", "Drake & Future", "Kanye & Kid Cudi"],
    correctAnswer: "Jay-Z & Kanye West",
    resultTitle: "THRONE!",
    resultCommentary: "Hov and Ye ran it back in 2011! Watch The Throne had the world asking 'What's Gucci my n***a?' Ball so hard!"
  },
  {
    id: "rap-34",
    category: "rap",
    question: "Which rapper is known as 'Young Money'?",
    hint: "Cash Money took over for the 99 and the 2000s",
    options: ["Lil Wayne", "Drake", "Nicki Minaj", "All of the above"],
    correctAnswer: "All of the above",
    resultTitle: "YOUNG MONEY!",
    resultCommentary: "Wayne, Drake, Nicki - Young Money Crew! Baby and Slim's empire raised a whole new generation. Cash Money forever!"
  },
  {
    id: "rap-35",
    category: "rap",
    question: "What is Ice Cube's real name?",
    hint: "N.W.A.'s lyricist from South Central",
    options: ["O'Shea Jackson", "Andre Young", "Eric Wright", "Lorenzo Patterson"],
    correctAnswer: "O'Shea Jackson",
    resultTitle: "WESTSIDE!",
    resultCommentary: "O'Shea Jackson Sr. wrote most of N.W.A.'s lyrics! From Compton to Hollywood, Cube stayed winning!"
  },
  {
    id: "rap-36",
    category: "rap",
    question: "Which song samples Slick Rick's 'La Di Da Di'?",
    hint: "Snoop's debut single with this sample",
    options: ["Who Am I (What's My Name)?", "Gin and Juice", "Nuthin' but a 'G' Thang", "Deep Cover"],
    correctAnswer: "Who Am I (What's My Name)?",
    resultTitle: "LA DI DA DI!",
    resultCommentary: "Snoop and Slick Rick connection! That sample on 'What's My Name' is pure hip-hop history. The Ruler stays influential!"
  },
  {
    id: "rap-37",
    category: "rap",
    question: "What's the name of Tyler, the Creator's label?",
    hint: "Odd things come from this label",
    options: ["TDE", "Dreamville", "Odd Future", "AWGE"],
    correctAnswer: "Odd Future",
    resultTitle: "GOLF WANG!",
    resultCommentary: "Odd Future Wolf Gang Kill Them All! Tyler brought Earl, Frank Ocean, and the whole squad. Golf Wang for life!"
  },
  {
    id: "rap-38",
    category: "rap",
    question: "Which rapper has a song called 'HUMBLE.'?",
    hint: "Sit down, be humble",
    options: ["Drake", "Kendrick Lamar", "J. Cole", "Chance The Rapper"],
    correctAnswer: "Kendrick Lamar",
    resultTitle: "BE HUMBLE!",
    resultCommentary: "K-Dot told everyone to sit down! That beat switch on HUMBLE. had the whole world doing the hand dance!"
  },
  {
    id: "rap-39",
    category: "rap",
    question: "What's the real name of Lil Uzi Vert?",
    hint: "This Philly rapper is known for wild hair and fashion",
    options: ["Symere Woods", "Rakim Mayers", "Jacques Webster", "Jeffery Williams"],
    correctAnswer: "Symere Woods",
    resultTitle: "UZI VERT!",
    resultCommentary: "Symere Bysil Woods from Philly! The pink diamond forehead era was something else. XO Tour Llif3 hit different!"
  },
  {
    id: "rap-40",
    category: "rap",
    question: "Which legendary hip-hop producer is known as 'Premo'?",
    hint: "Gang Starr's DJ half",
    options: ["DJ Premier", "Pete Rock", "Large Professor", "J Dilla"],
    correctAnswer: "DJ Premier",
    resultTitle: "GANG STARR!",
    resultCommentary: "Christopher Martin, aka DJ Premier! Those scratches and samples are unmistakable. RIP Guru, Gang Starr forever!"
  },
  {
    id: "rap-41",
    category: "rap",
    question: "What city is Scarface from?",
    hint: "The South got something to say, and he said it first",
    options: ["New Orleans", "Houston", "Atlanta", "Memphis"],
    correctAnswer: "Houston",
    resultTitle: "H-TOWN!",
    resultCommentary: "Brad Jordan put Houston on the map! The Geto Boys legend is still the best storyteller from the South. Mind Playing Tricks!"
  },
  {
    id: "rap-42",
    category: "rap",
    question: "Which album is 'Jesus Walks' from?",
    hint: "Kanye's debut that changed everything",
    options: ["Late Registration", "Graduation", "The College Dropout", "808s & Heartbreak"],
    correctAnswer: "The College Dropout",
    resultTitle: "YE THE TRUTH!",
    resultCommentary: "2004 - Kanye dropped out and changed the game! Jesus Walks proved you can talk about faith and still be hip-hop. Dropout forever!"
  },
  {
    id: "rap-43",
    category: "rap",
    question: "What's the name of Pusha T's brother?",
    hint: "They were in Clipse together",
    options: ["Malice", "No Malice", "Gene Thornton Jr.", "All of the above"],
    correctAnswer: "All of the above",
    resultTitle: "CLIPSE!",
    resultCommentary: "No Malice, formerly Malice, aka Gene Thornton Jr.! The Thornton brothers from Virginia had the coke rap on lock!"
  },
  {
    id: "rap-44",
    category: "rap",
    question: "Which rapper is known for the 'Ruff Ryders' crew?",
    hint: "X gon' give it to ya",
    options: ["Ja Rule", "DMX", "Eve", "All of the above"],
    correctAnswer: "All of the above",
    resultTitle: "RUFF RYDERS!",
    resultCommentary: "DMX, Eve, The Lox - Ruff Ryders was a movement! Those ATVs in the videos were legendary. RIP Dark Man X!"
  },
  {
    id: "rap-45",
    category: "rap",
    question: "What's Big Sean's real name?",
    hint: "Detroit's finest, signed by Ye",
    options: ["Sean Anderson", "Sean Combs", "Sean Carter", "Sean Paul"],
    correctAnswer: "Sean Anderson",
    resultTitle: "I DECIDE!",
    resultCommentary: "Sean Michael Leonard Anderson from Detroit! From GOOD Music to owning his own, Don Sean keeps winning!"
  },
  {
    id: "rap-46",
    category: "rap",
    question: "Which rapper founded No Limit Records?",
    hint: "Make em say uhh, na na na na",
    options: ["Birdman", "Master P", "Juvenile", "C-Murder"],
    correctAnswer: "Master P",
    resultTitle: "NO LIMIT!",
    resultCommentary: "Percy Miller built No Limit from the ground up! That tank logo was everywhere in the 90s. Bout it bout it!"
  },
  {
    id: "rap-47",
    category: "rap",
    question: "What's the name of Chief Keef's famous debut single?",
    hint: "That's that... you know what it is",
    options: ["I Don't Like", "Love Sosa", "Hate Bein' Sober", "3Hunna"],
    correctAnswer: "I Don't Like",
    resultTitle: "BANG BANG!",
    resultCommentary: "Chief Keef changed Chicago rap in 2012! Kanye hopped on the remix and drill went worldwide. O Block legend!"
  },
  {
    id: "rap-48",
    category: "rap",
    question: "Which female rapper is from Trinidad?",
    hint: "The Queen of Rap claims this island heritage",
    options: ["Cardi B", "Nicki Minaj", "Megan Thee Stallion", "Rihanna"],
    correctAnswer: "Nicki Minaj",
    resultTitle: "BARBIE!",
    resultCommentary: "Onika Tanya Maraj-Petty was born in Trinidad! The Barbz know - Nicki went from Queens to running the game. Pink Friday forever!"
  },
  {
    id: "rap-49",
    category: "rap",
    question: "What label is Baby Keem signed to?",
    hint: "Kendrick's label and cousin",
    options: ["Dreamville", "pgLang", "TDE", "Interscope"],
    correctAnswer: "pgLang",
    resultTitle: "PGGANG!",
    resultCommentary: "Hykeem Carter is Kendrick's cousin and pgLang's star! 'family ties' proved the bloodline is strong. The Melodic Blue was crazy!"
  },
  {
    id: "rap-50",
    category: "rap",
    question: "Which rapper has the alias 'La Flame'?",
    hint: "Astroworld's architect",
    options: ["Metro Boomin", "Travis Scott", "Kid Cudi", "Don Toliver"],
    correctAnswer: "Travis Scott",
    resultTitle: "LA FLAME!",
    resultCommentary: "Jacques Bermon Webster II, aka La Flame! Cactus Jack stays setting the culture on fire. Straight up!"
  },
  {
    id: "rap-51",
    category: "rap",
    question: "What was Lil Kim's debut album?",
    hint: "Brooklyn's Queen Bee stepped up",
    options: ["Hard Core", "The Notorious K.I.M.", "La Bella Mafia", "Naked Truth"],
    correctAnswer: "Hard Core",
    resultTitle: "QUEEN BEE!",
    resultCommentary: "1996 - Lil Kim dropped Hard Core and changed the game for female rappers forever! Brooklyn's finest rep!"
  },
  {
    id: "rap-52",
    category: "rap",
    question: "Which producer made the beat for 'Still D.R.E.'?",
    hint: "It wasn't Dre... but who?",
    options: ["Dr. Dre", "Scott Storch", "Timbaland", "The Neptunes"],
    correctAnswer: "Scott Storch",
    resultTitle: "STORCH!",
    resultCommentary: "Scott Storch played that iconic piano! Dre gets the credit, but Storch made the beat of the 2000s. That melody is legendary!"
  },
  {
    id: "rap-53",
    category: "rap",
    question: "What's the name of GloRilla's breakout hit?",
    hint: "F.N.F. stands for...",
    options: ["Tomorrow", "F.N.F. (Let's Go)", "Blessed", "Yeah Glo!"],
    correctAnswer: "F.N.F. (Let's Go)",
    resultTitle: "GLO UP!",
    resultCommentary: "Gloria Woods had every girl yelling 'F.N.F., let's go!' Memphis' new queen! Yo Gotti signed a star!"
  },
  {
    id: "rap-54",
    category: "rap",
    question: "Which rapper is known for saying 'It's Morbin' Time'?",
    hint: "Trick question - this is a meme, not rap!",
    options: ["Jared Leto", "This isn't a rapper", "Morbius", "None of the above"],
    correctAnswer: "This isn't a rapper",
    resultTitle: "YOU CAUGHT THAT!",
    resultCommentary: "That was a test! Real hip-hop heads know the difference between memes and bars. You passed - stay cultured!"
  },
  {
    id: "rap-55",
    category: "rap",
    question: "What group was Method Man part of?",
    hint: "Staten Island's finest martial arts crew",
    options: ["Mobb Deep", "Wu-Tang Clan", "Boot Camp Clik", "D.I.T.C."],
    correctAnswer: "Wu-Tang Clan",
    resultTitle: "WU-TANG!",
    resultCommentary: "Clifford Smith, aka Method Man, aka Johnny Blaze! Wu-Tang forever, and Meth & Red are still goals!"
  }
];

export const getRandomQuestions = (count: number = 10): Question[] => {
  const shuffled = [...rapQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
