setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*2 cp").gain(.25).pan(.4)

$: n("0 3 7 5").scale("g:minor").s("gm_tenor_sax")
  .lpf(2400).release(.3).room(.3).gain(.35)

$: n("<g1 d2 eb2 f1>").scale("g:minor").s("sawtooth")
  .lpf(600).release(.3).gain(.5)
