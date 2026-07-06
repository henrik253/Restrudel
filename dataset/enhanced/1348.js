setcpm(128/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: s("~ cymbal ~ ~").gain(.3).room(.3)

$: n("0 3 7 5").scale("c:minor").s("pulse")
  .lpf(2000).resonance(6).release(.2).gain(.4)

$: n("<c2 g1 eb2 f1>").scale("c:minor").s("sawtooth")
  .lpf(600).release(.3).gain(.5)
