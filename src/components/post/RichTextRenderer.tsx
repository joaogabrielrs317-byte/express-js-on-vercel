interface Props {
  content: string
}

export default function RichTextRenderer({ content }: Props) {
  return (
    <div
      className="prose-editorial"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
