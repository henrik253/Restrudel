setcpm(118/4)

$: s("bd ~ sd ~").bank("BossDR110").room(.7).gain(.85)

$: s("hh!4").gain(.2).pan(.4)

$: n("0 3 7 5").scale("c:minor").s("clavisynth")
  .lpf(2000).release(.2).clip(.6).delay(.4).gain(.4)

$: n("0 3 7 10 7 5 3 0").scale("c:minor").s("gm_string_ensemble_1")
  .lpf(3000).release(.3).room(.4).gain(.3)

$: n("<c2 c2 g1 ab1>").scale("c:minor").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
