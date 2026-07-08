setcpm(130/4)

$: s("bd ht ~ bd").bank("RolandTR909").gain(.8)

$: s("~ hh ~ hh").gain(.2)

$: note("e5 f4 a4 c5 c4 e4 g4 g4").sound("square").clip(.85).lpf(1772).gain(.35)

$: s("perc ~ perc ~").lpf(4000).gain(.3)
