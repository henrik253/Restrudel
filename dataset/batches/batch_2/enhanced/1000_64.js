setcpm(105/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").room(.3).delay(.2).lpf(3000).gain(.15)

$: note("a1 f1 c2").struct("x(5,8,-1)").s("sawtooth").lpf(600).release(.2).gain(.5)

$: note("c3 eb3").s("square").cutoff(471).release(.15).gain(.35)
