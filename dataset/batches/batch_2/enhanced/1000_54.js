setcpm(100/4)

$: s("bd*2 ~ bd ~").bank("RolandTR909").gain(.85)

$: s("~ hh ~ hh").gain(.2)

$: note("<g3 c3>").chord("<m7 7>").clip(.9).sound("gm_cello").gain(.35).room(.3)

$: s("gm_overdriven_guitar ~ gm_overdriven_guitar ~").gain(.4).lpf(1800)
