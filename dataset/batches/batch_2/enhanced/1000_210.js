setcpm(128/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.2)

$: note("c5 c#5 d#5 d5").sound("square").lpf(2200).release(.15).gain(.4)

$: s("kick*4 ~").slow(2).gain(.3)
