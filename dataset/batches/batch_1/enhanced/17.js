setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").room(.8).gain(.85)

$: s("hh*8").gain("[.2 .13]*4").pan(.5)

$: n("0 3 7 5 3 7 10 7").scale("a:minor").s("sawtooth")
  .lpf(sine.range(600, 2400).slow(4)).resonance(7)
  .release(.15).room(.3).delay(.4).gain(.4)

$: n("<a1 e2 f1 g1>").scale("a:minor").s("square")
  .lpf(650).release(.25).gain(.5)
