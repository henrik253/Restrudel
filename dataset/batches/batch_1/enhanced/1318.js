setcpm(122/4)

$: s("bd ~ sd ~").bank("Linn9000").gain(.85)

$: s("rim*4").gain(.25)

$: s("~ lt ~ ht").hpf(400).fm(2).gain(.4)

$: n("0 3 7 5").scale("c:minor").s("sawtooth")
  .lpf(1600).release(.2).gain(.4)
