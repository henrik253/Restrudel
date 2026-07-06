setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ bongo:3 ~ bongo:3").gain(.3)

$: n("5 4 5 ~ 2 ~").scale("e:minor").s("supersaw")
  .clip(.86).lpf(2200).release(.2).room(.3).gain(.4)

$: n("<e1 b1 c2 g1>").scale("e:minor").s("sawtooth")
  .lpf(600).release(.3).gain(.5)
