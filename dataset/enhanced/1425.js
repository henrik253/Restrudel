setcpm(110/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.2).pan(.4)

$: n("0 3 7 5 7 8 7 5").scale("a:minor").s("ocarina")
  .hpf(1000).fm(2).release(.2).room(.4).gain(.4)

$: n("<a1 a1 e1 f1>").scale("a:minor").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
