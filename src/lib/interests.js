export const INTERESTS = [
  // Striking
  { key:'boxing', label:'Boxing', category:'striking', icon:'🥊' },
  { key:'muay_thai', label:'Muay Thai', category:'striking', icon:'🥊' },
  { key:'kickboxing', label:'Kickboxing', category:'striking', icon:'🥊' },
  { key:'karate', label:'Karate', category:'striking', icon:'🥋' },
  { key:'taekwondo', label:'Taekwondo', category:'striking', icon:'🥋' },
  { key:'sanda', label:'Sanda', category:'striking', icon:'🥊' },
  // Grappling
  { key:'bjj', label:'BJJ', category:'grappling', icon:'🥋' },
  { key:'wrestling', label:'Wrestling', category:'grappling', icon:'🤼' },
  { key:'judo', label:'Judo', category:'grappling', icon:'🥋' },
  { key:'sambo', label:'Sambo', category:'grappling', icon:'🥋' },
  // Hybrid/Systems
  { key:'mma', label:'MMA', category:'hybrid', icon:'🥊' },
  { key:'krav_maga', label:'Krav Maga', category:'hybrid', icon:'🥊' },
  { key:'jeet_kune_do', label:'Jeet Kune Do', category:'hybrid', icon:'🥊' },
  // Traditional/Others
  { key:'kung_fu', label:'Kung Fu', category:'traditional', icon:'🥋' },
  { key:'kendo', label:'Kendo/Iaido', category:'traditional', icon:'🗡️' },
  { key:'kali', label:'Kali/Escrima', category:'traditional', icon:'🗡️' },
]

export const BELT_ARTS = {
  bjj: ['White','Blue','Purple','Brown','Black'],
  judo: ['6 Kyu','5 Kyu','4 Kyu','3 Kyu','2 Kyu','1 Kyu','1 Dan','2 Dan','3 Dan','4 Dan','5 Dan'],
  karate: ['10 Kyu','9 Kyu','8 Kyu','7 Kyu','6 Kyu','5 Kyu','4 Kyu','3 Kyu','2 Kyu','1 Kyu','Shodan','Nidan','Sandan','Yondan','Godan'],
  taekwondo: ['10 Gup','9 Gup','8 Gup','7 Gup','6 Gup','5 Gup','4 Gup','3 Gup','2 Gup','1 Gup','1 Dan','2 Dan','3 Dan','4 Dan','5 Dan'],
}

export function artHasBelts(artKey){
  return Boolean(BELT_ARTS[artKey])
}
