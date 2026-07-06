setcpm(118/4)

$: s("bd ~ sd ~").bank("KorgDDM110").gain(.85)

$: s("cr ~ lt ~").gain(.4).pan(.4)

$: n("0 3 7 5 3 0 5 7").scale("g:minor").s("sawtooth")
  .lpf(2000).release(.2).room(.3).clip(.95).gain(.4)

$: n("<g1 g1 c2 f1>").scale("g:minor").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
