setcpm(114/4)

$: s("bd ~ sd ~").bank("RolandTR808").lpf(700).gain(.85)

$: s("~ hat ~ hat").gain(.2)

$: note("c1 f1 g1 a#1").s("sawtooth")
  .lpf(700).release(.2).gain(.5)

$: note("d4 ~ c4 c4 a4 ~ f#5 a#4").s("square")
  .lpf(1800).resonance(5).release(.15).delay(.35).gain(.4)

$: n("2 ~ 5 6 ~ 2*3").scale("d:minor").s("triangle")
  .lpf(2000).release(.2).room(.3).gain(.35)
