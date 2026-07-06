setcpm(98/4)

$: s("rd*3 rd rd*2 rd").gain(.22)

$: s("bd ~ lt ~ bd ~ [lt lt] ~").gain(.7)

$: n("0 2 4 7 ~ 4 2 ~").scale("e:minor").s("psaltery_pluck").release(.07).room(.54).delay(.4).gain(.4)

$: n("<7 9>").scale("e:minor").s("gm_lead_1_square").lpf(1800).release(.2).gain(.22).pan(.4)

$: note("<e3 ~ d3 ~>").s("gm_harmonica").gain(.2).room(.4)
