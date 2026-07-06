setcpm(95/4)

$: s("bd:5 ~ sd ~ ~ bd:5 sd ~").gain(.8)

$: n("0 ~ 2 ~ 4 3 ~ ~").scale("a:minor").s("gm_ocarina").release(.2).room(.5).gain(.3)

$: note("a1 ~ ~ a1 ~ ~ g1 ~").s("square").lpf(400).release(.2).gain(.5)

$: s("hh*4").gain(.18)
