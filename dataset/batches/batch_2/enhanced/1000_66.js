setcpm(100/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.15)

$: note("e5 c5 d5 e5").s("triangle").gain(.4).lpf(1800).room(.4).delay(.3).release(.15)

$: note("d3 ~ f3 a3").s("gm_tuba").release(.3).gain(.5)

$: n("0 3 7 5").scale("d:minor").s("square").lpf(900).release(.15).gain(.35)
