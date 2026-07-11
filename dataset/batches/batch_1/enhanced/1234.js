setcpm(124/4)

$: s("bd ~ bd ~ bd ~ ~ sd").bank("RolandTR909").gain(.82)

$: s("oh*4").gain(.2)

$: n("4 6 4 ~ 7 2").scale("a:minor").s("sawtooth")
  .lpf(2233).resonance(5).room(.2).release(.15).delay(.35).gain(.4)

$: note("<a3 c4 e4 g4>").s("gm_pad_warm")
  .attack(.4).release(1.5).room(.5).gain(.28)

$: n("<a1 a1 e2 c2>").scale("a:minor").s("square")
  .lpf(600).release(.2).gain(.5)
