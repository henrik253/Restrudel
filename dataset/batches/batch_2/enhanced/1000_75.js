setcpm(118/4)

$: s("bd ~ sd ~").bank("LinnDrum").gain(.85)

$: s("perc*3 ~ crash ~").gain(.3)

$: note("e3 a3 c4 e4 a4").s("sawtooth").release(.12).gain(.4)

$: s("rd*3 rd bd").clip(.85).gain(.3)
