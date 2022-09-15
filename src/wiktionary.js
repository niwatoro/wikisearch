import React, { Component } from "react"
import {
    Input,
    Select,
    Box,
    Flex,
    Container,
    Center,
    Spacer,
    IconButton,
    Heading,
    UnorderedList,
    ListItem,
    OrderedList,
    Text,
    Tag,
    Wrap,
    HStack,
    Link,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    useDisclosure,
    DrawerCloseButton,
    DrawerBody,
    DrawerHeader,
    Divider,
    useToast,
    Spinner,
    Icon,
} from '@chakra-ui/react'
import {
    TimeIcon,
    SearchIcon
} from '@chakra-ui/icons'

import { AiFillHeart } from 'react-icons/ai'
import { motion } from "framer-motion"

import parse, { domToReact } from "html-react-parser"

export default class Wiktionary extends Component {
    constructor(props) {
        super(props)
        this.state = {
            title: "",
            wiki_lang: "en",
            wiktionary_lang: "en",
            wiki_html: "",
            wiktionary_html: "",
            wiktionary_id: 0,
            wiki_history: [],
            wiktionary_history: [],
            wiki_suggest: [],
            wiktionary_suggest: [],
        }
    }

    UpdateWikiSuggestion = async (title) => {
        if (title === "") {
            return
        }

        const wiki_lang = this.state.wiki_lang
        const response = await fetch("https://" + wiki_lang + ".wikipedia.org/w/api.php?action=query&list=search&srlimit=5&srsearch=" + title + "&origin=*&format=json");
        const data = await response.json()
        this.setState({
            wiki_suggest: data.query.search,
        })
    }

    onInputSearch = (e) => {
        this.setState({
            title: e.target.value,
        }, async () => {
            const title = this.state.title
            this.UpdateWikiSuggestion(title)
        })
    }

    SearchWiki = (title) => {
        const wiki_lang = this.state.wiki_lang
        const wiki_id = this.state.wiki_id
        const wiki_history = this.state.wiki_history

        if (wiki_history[wiki_id] !== title) {
            this.setState({
                wiki_id: title in wiki_history ? wiki_id + 1 : wiki_history.length,
                wiki_history: [...wiki_history, title],
            })
        }

        this.setState({
            wiki_html: "<center><spinner /></center>",
        }, async () => {
            const response = await fetch("https://" + wiki_lang + ".wikipedia.org/w/api.php?action=query&prop=extracts&exintro&titles=" + title + "&origin=*&format=json");
            const data = await response.json()
            let ids = []
            for (let id in data.query.pages) {
                ids.push(id)
            }
            if (ids[0] === "-1") {
                this.setState({
                    wiki_html: "<h5>このウィキでページ「" + title + "」は見つかりませんでした。他の言語をお試しください。</h5>",
                })
            } else {
                this.setState({
                    wiki_html: "<h1>" + title.toUpperCase() + "</h1>" + data.query.pages[ids[0]].extract,
                })
            }
        })
    }

    onClickSearch = async () => {
        const title = this.state.title;
        if (title === "") {
            return
        } else if (title === "xiaoqi" || title === "sookie" || title === "筱琦" || title === "郭筱琦") {
            this.setState({
                wiki_html: "<love />"
            })
            return
        }

        this.setState({
            wiki_html: "",
        }, () => {
            this.SearchWiki(title)
        })
    }

    onClickLinkSearch = (title) => {
        this.setState({
            title: title
        }, () => this.onClickSearch())
    }

    onKeyDownSearch = (event) => {
        if (event.key === "Enter" && this.state.title !== "") {
            this.onClickSearch(event)
        }
    }

    SearchWiktionary = async (selected_text) => {
        if (selected_text === "") {
            return
        }

        this.setState({
            wiktionary_html: "",
        })
        const wiktionary_lang = this.state.wiktionary_lang
        const wiktionary_id = this.state.wiktionary_id
        const wiktionary_history = this.state.wiktionary_history

        if (wiktionary_history[wiktionary_id] !== selected_text) {
            this.setState({
                wiktionary_id: selected_text in wiktionary_history ? wiktionary_id + 1 : wiktionary_history.length,
                wiktionary_history: [...wiktionary_history, selected_text],
            })
        }

        const response = await fetch("https://" + wiktionary_lang + ".wiktionary.org/w/api.php?action=query&prop=extracts&titles=" + selected_text + "&origin=*&format=json");
        const data = await response.json();
        let ids = [];
        for (let id in data.query.pages) {
            ids.push(id)
        }
        if (ids[0] === "-1") {
            this.setState({
                wiktionary_html: "<h5>このウィキでページ「" + selected_text + "」は見つかりませんでした。他の言語をお試しください。</h5>"
            })
        } else {
            this.setState({
                wiktionary_html: data.query.pages[ids[0]].extract
            })
        }

        const similar_response = await fetch("https://" + wiktionary_lang + ".wiktionary.org/w/api.php?action=query&list=search&srlimit=5&srsearch=" + selected_text + "&origin=*&format=json");
        const similar_data = await similar_response.json()
        this.setState({
            wiktionary_suggest: similar_data.query.search,
        })
    }

    onChangeSwitchLangWiki = (e) => {
        this.setState({
            wiki_lang: e.target.value,
        }, () => {
            this.onClickSearch()
            this.UpdateWikiSuggestion(this.state.title)
        })
    }

    onChangeSwitchLangWiktionary = (e) => {
        this.setState({
            wiktionary_lang: e.target.value,
        }, () => {
            this.onMouseUpSearch()
        })
    }

    ParseHtmlToReact = (html_string) => {
        const options = {
            replace: domNode => {
                if (domNode.children) {
                    const replaced = domToReact(domNode.children, options)
                    if (domNode.children === "\n") {
                        return null
                    } else if (domNode.name === "h1") {
                        return (<Heading margin={"10px 0 10px"} size={"xl"}>{replaced}</Heading>)
                    } else if (domNode.name === "h2") {
                        return (<Heading margin={"10px 0 10px"} size={"lg"}>{replaced}</Heading>)
                    } else if (domNode.name === "h3") {
                        return (<Heading margin={"10px 0 5px"} size={"md"}>{replaced}</Heading>)
                    } else if (domNode.name === "h4") {
                        return (<Heading margin={"10px 0 5px"} size={"sm"}>{replaced}</Heading>)
                    } else if (domNode.name === "h5") {
                        return (<Heading margin={"5px 0 2px"} size={"xm"}>{replaced}</Heading>)
                    } else if (domNode.name === "ul") {
                        return (<UnorderedList>{replaced}</UnorderedList>)
                    } else if (domNode.name === "ol") {
                        return (<OrderedList>{replaced}</OrderedList>)
                    } else if (domNode.name === "li") {
                        return (<ListItem>{replaced}</ListItem>)
                    } else if (domNode.name === "p") {
                        return (<Box>{replaced}</Box>)
                    } else if (domNode.name === "b") {
                        return (<Text as="b">{replaced}</Text>)
                    } else if (domNode.name === "i") {
                        return (<Text as="i">{replaced}</Text>)
                    } else if (domNode.name === "strong") {
                        return (<Text as="em">{replaced}</Text>)
                    } else if (domNode.name === "sup") {
                        return (<Text as="sup">{replaced}</Text>)
                    } else if (domNode.name === "span") {
                        return (<>{replaced}</>)
                    } else if (domNode.name === "hr") {
                        return (<Divider margin={"10px 0 0"} />)
                    } else if (domNode.name === "spinner") {
                        return (<Spinner thickness="4px" size="xl" color="blue.500" />)
                    } else if (domNode.name === "center") {
                        return (<Center margin={"10% 0 0"}>{replaced}</Center>)
                    } else if (domNode.name === "love") {
                        return (<Love />)
                    } else {
                        return null
                    }
                } else {
                    return null
                }
            }
        }
        const parsed = parse(html_string.replace(/\n|<ul><li><\/ul><\/li>/g, "").replace(/<li><li>/g, "<li>"), options)
        return parsed
    }

    CreateSuggest = (suggest) => {
        if (suggest.length === 0) {
            return
        } else {
            const suggest_list = suggest.map((value, idx) => {
                return (
                    <Tag
                        key={idx}
                        colorScheme="pink"
                        onMouseUp={this.onMouseUpSearch}
                        onClick={this.onClickLinkSearch.bind(this, value.title)}>
                        <Link>{value.title}</Link>
                    </Tag>)
            })
            return suggest_list
        }
    }

    render() {
        const wiki_lang = this.state.wiki_lang
        const wiktionary_lang = this.state.wiktionary_lang
        const wiki_html = this.state.wiki_html
        const wiki_suggest = this.state.wiki_suggest
        const wiki_history = this.state.wiki_history

        return (
            <Flex>
                <Container>
                    <Flex
                        padding={"20px"}
                        bgColor={"pink.200"}>
                        <HStack>
                            <Input
                                width={"auto"}
                                bgColor={"white"}
                                type="text"
                                onInput={this.onInputSearch}
                                onKeyDown={this.onKeyDownSearch} />
                            <IconButton
                                aria-label="Search database"
                                icon={<SearchIcon />}
                                colorScheme="pink"
                                margin={"0 5px 0"}
                                onClick={this.onClickSearch} />
                            <DrawerHistory
                                history={wiki_history}
                                Search={this.SearchWiki} />
                        </HStack>
                        <Spacer />
                        <Flex>
                            <Select bgColor={"white"} value={wiki_lang} onChange={this.onChangeSwitchLangWiki}>
                                <option value="en">English</option>
                                <option value="ja">日本語</option>
                                <option value="zh">中文</option>
                                <option value="zh-yue">粵語</option>
                                <option value="fr">Français</option>
                                <option value="ru">Руский</option>
                            </Select>
                        </Flex>
                    </Flex>
                    <Wrap padding={"10px"} bgColor={"pink.50"}>
                        <Text>もしかして：</Text>
                        {this.CreateSuggest(wiki_suggest)}
                    </Wrap>
                    <ToastWord
                        parser={this.ParseHtmlToReact}
                        wiktionary_lang={wiktionary_lang}
                        wiki_html={wiki_html} />
                </Container>
            </Flex>)
    }
}

function DrawerHistory(props) {
    const { history, Search } = props
    const reversed_history = history.map((_, idx, arr) => arr[arr.length - 1 - idx])

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [placement, setPlacement] = React.useState('left')

    return (
        <>
            <IconButton
                icon={<TimeIcon />}
                margin={"0 2px 0"}
                colorScheme="pink"
                onClick={onOpen} />
            <Drawer
                isOpen={isOpen}
                onClose={onClose}
                placement={placement}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>履歴</DrawerHeader>
                    <DrawerBody>
                        {<UnorderedList>{
                            reversed_history.map((value, idx) => {
                                return (
                                    <ListItem
                                        key={idx}
                                        onClick={() => {
                                            onClose()
                                            Search(value)
                                        }}>
                                        <Link>{value}</Link>
                                    </ListItem>)
                            })}
                        </UnorderedList>}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>

    )
}

function ToastWord(props) {
    const { parser, wiktionary_lang, wiki_html } = props
    const toast = useToast()

    return (
        <Box
            onMouseUp={async () => {
                const selected_text = window.getSelection().toString().toLowerCase();

                if (selected_text !== "") {
                    const response = await fetch("https://" + wiktionary_lang + ".wiktionary.org/w/api.php?action=query&prop=extracts&titles=" + selected_text + "&origin=*&format=json");
                    const data = await response.json();

                    let wiktionary_html = ""
                    let ids = [];
                    for (let id in data.query.pages) {
                        ids.push(id)
                    }
                    if (ids[0] === "-1") {
                        wiktionary_html = "<h5>このウィキでページ「" + selected_text + "」は見つかりませんでした。他の言語をお試しください。</h5>"
                    } else {
                        wiktionary_html = "<h1>" + selected_text.toUpperCase() + "</h1>" + data.query.pages[ids[0]].extract
                    }
                    const html_react = parser(wiktionary_html)

                    toast({
                        title: <Text noOfLines={1}>{selected_text.toUpperCase()}</Text>,
                        description:
                            <Container>
                                <Box
                                    css={{
                                        "&::-webkit-scrollbar": {
                                            width: "4px",
                                        },
                                        "&::-webkit-scrollbar-track": {
                                            width: "6px",
                                        },
                                        "&::-webkit-scrollbar-thumb": {
                                            background: "#8ccef0",
                                            borderRadius: "24px",
                                        },
                                    }}
                                    overflowX="auto"
                                    maxHeight="80vh"
                                    fontSize={"sm"}>
                                    {html_react}
                                </Box>
                            </Container>,
                        status: "info",
                        position: "top-right",
                        isClosable: true,
                        containerStyle: {
                            width: '70%',
                        }
                    })
                }
            }}>
            {parser(wiki_html)}
        </Box>)
}

function Love() {
    return (
        <Box>
            <motion.div
                style={{ marginTop: "20vh" }}
                animate={{
                    scale: [0, 0.25, 1, 4, 10, 10],
                    rotate: [0, 120, 240, 360, 0]
                }}
                transition={{
                    duration: 1
                }}>
                <Center>
                    <Icon
                        as={AiFillHeart}
                        color={"red.400"}
                        fontSize={"30px"} />
                </Center>
            </motion.div>
            <motion.div
                style={{ marginTop: "15vh" }}
                animate={{
                    opacity: [0, 1],
                }}
                transition={{
                    delay: 1
                }}>
                <Center>
                    <Heading>郭筱琦：矢﨑友基の愛する人</Heading>
                </Center>
            </motion.div>
        </Box>
    )
}

export { Wiktionary }