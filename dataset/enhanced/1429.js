setcpm(122/4)

$: s("bd ~ sd ~").bank("KorgDDM110").room(.48).gain(.85)

$: s("hh*8").gain(.2).pan(.4)

$: note("a3 d4 d#4 d4 a3 d5 c#5 c5").s("square")
  .lpf(2000).release(.2).room(.3).gain(.4)

$: note("c2 a1 f1 e2").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
