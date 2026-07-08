setcpm(108/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*7 ~").hpf(200).lpf(4210).gain(.2)

$: n("0 3 7 5").scale("a:minor").s("sawtooth")
  .lpf(2000).room(.6).release(.2).gain(.4)

$: s("clave ~ clave ~").gain(.3).pan(.6)
