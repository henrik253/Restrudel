setcpm(100/4)

$: note("c2 ~ g1 ~ bb1 ~ c2 ~").s("gm_tuba").release(.2).gain(.5)

$: s("perc*3 ~").gain(.3)

$: s("lt ~ lt ~ lt ~").slow(2).gain(.45)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.75)

$: n("<0 ~ 3 5>").scale("c:minor").s("square").lpf(1200).release(.2).gain(.25)
