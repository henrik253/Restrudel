setcpm(120/4)

$: s("~ ~ bd ~").bank("RolandTR909").lpf(5000).room(.6).gain(.85)

$: s("hh*8").gain(.2).pan(.4)

$: note("c5 b3 d4 g4 c4 e4 a4 a3").sound("sawtooth").lpf(2000)
  .release(.2).room(.3).gain(.4)

$: note("b2 f#2 f2 bb2 eb2 bb3 c#2 f#2").sound("sawtooth")
  .lpf(600).release(.2).gain(.5)

$: n("<g1 g1 d1 f1>").scale("g:minor").s("square")
  .lpf(1500).release(.2).gain(.3)
