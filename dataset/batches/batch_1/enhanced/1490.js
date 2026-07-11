setcpm(122/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: note("[g3,c4,e4] ~ ~ [f3,a3,c4] ~ ~ [f3,a3,c4] ~").s("piano").room(.36).release(.3).gain(.4)

$: note("e5 ~ f4 a4 ~ c5 ~ ~").s("piano").release(.3).room(.4).gain(.35).pan(.2)

$: note("c2 ~ f1 ~ f1 ~ c2 ~").s("square").lpf(500).release(.15).gain(.5)

$: s("[~ hh]*4").gain(.2).pan(.3)
