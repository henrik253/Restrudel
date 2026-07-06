setcpm(112/4)

$: note("<[f3 a3 c4 f4] [c4 e4 g4 c5] [g3 b3 d4 g4] [a3 c4 e4 a4]>*2")
  .s("clavisynth").pan(.5).attack(.05).room(.6).release(.2).gain(.4)

$: note("<f2 c2 g2 a1>*2").s("square").lpf(500).release(.2).gain(.5)

$: note("<[f3,a3,c4] [c3,e3,g3]>").s("gtr").slow(2).room(1.2).attack(.05).gain(.3)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.75)

$: s("hh*8").gain(.15)
