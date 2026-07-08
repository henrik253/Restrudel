setcpm(96/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*4 ~ hh ~").gain(.2).release(.1)

$: s("woodblock:1 ~ woodblock:2*2 ~").gain(.35).pan(.6)

$: n("0 3 5 7").scale("c:minor").s("sawtooth")
  .lpf(1200).release(.2).gain(.4)
