setcpm(124/4)

$: s("bd ~ ~ bd ~ ~ bd ~").bank("RolandTR909").gain(.82)

$: s("hh*16").clip(.81).gain("[.2 .12]*8").pan(.5)

$: note("d4 e4 f#4 g#4 f#4 e4").s("woodblock:1")
  .clip(1).gain(.4).pan(.6)

$: note("<d2 e2 f#2 g#2>").s("sawtooth")
  .lpf(900).resonance(6).release(.25).room(.3).gain(.45)
