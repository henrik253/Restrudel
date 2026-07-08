setcpm(105/4)

$: s("bd ~ ~ bd sd ~ ~ ~").gain(.8)

$: note("e4 ~ a4 ~ e4 ~ [g4 a4] ~").s("gm_oboe").release(.2).room(.4).gain(.3)

$: note("a1 ~ a1 ~ e2 ~ a1 ~").s("square").lpf(500).release(.15).gain(.5)

$: s("hh*4").gain(.18)
