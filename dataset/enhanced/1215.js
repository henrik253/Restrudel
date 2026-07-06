setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ ~ ~ crash").gain(.3)

$: s("rd*3 perc").gain(.3)

$: note("c5 ~ eb5 ~").s("clavisynth")
  .clip(.6).sustain(.17).lpf(1200).resonance(6).release(.15).gain(.35)

$: note("<c2 c2 g1 ab1>").s("triangle")
  .lpf(700).release(.2).gain(.5)
